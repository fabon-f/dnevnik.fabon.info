import "temporal-polyfill-lite/global";
import { rm } from "node:fs/promises";
// @ts-expect-error
import { HtmlBasePlugin } from "@11ty/eleventy";
import shikiPlugin from "@shikijs/markdown-exit";
import { VentoPlugin } from "eleventy-plugin-vento";
import { createMarkdownExit } from "markdown-exit";
// @ts-expect-error
import footNotePlugin from "markdown-it-footnote";
import { getSlug } from "./lib/data.ts";
import { generateAtom } from "./lib/feed.ts";
import { parsePageDate, zonedDateTimeFromPageDate } from "./lib/temporal.ts";

const md = createMarkdownExit();
md.use(shikiPlugin({ theme: "nord" }));
md.use(footNotePlugin);

export default async function (eleventyConfig: any) {
  eleventyConfig.addPlugin(VentoPlugin);
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.setInputDirectory("src");
  eleventyConfig.addPassthroughCopy({ public: "." });
  eleventyConfig.on("eleventy.before", async ({ directories, runMode }: any) => {
    if (runMode === "build") {
      await rm(directories.output, { recursive: true, force: true });
    }
  });
  eleventyConfig.addPreprocessor("drafts", "*", (data: any) => {
    if (process.env.ELEVENTY_RUN_MODE === "build" && data.draft) {
      return false;
    }
  });
  eleventyConfig.addCollection("posts", (collectionsApi: any) =>
    collectionsApi.getFilteredByGlob("src/posts/*.md"),
  );
  eleventyConfig.addExtension("md", {
    async compile(input: string) {
      return async () => await md.renderAsync(input);
    },
  });
  eleventyConfig.addDateParsing((date?: Date | string) => {
    if (typeof date === "string") {
      return new Date(parsePageDate(date).epochMilliseconds);
    }
    return date;
  });
  eleventyConfig.addTemplate(
    "feed.11ty.js",
    class {
      data() {
        return {
          permalink: "/feed.xml",
        };
      }
      async render(this: any, { collections }: any) {
        const baseUrl = "https://dnevnik.fabon.info";
        const renderTransforms = this.renderTransforms.bind(this);
        const transformWithHtmlBase = this.transformWithHtmlBase.bind(this);
        const limit = 10;
        const posts = (collections.posts as any[]).toReversed().slice(0, limit);
        const normalizedContents: string[] = await Promise.all(
          posts.map(async (post) =>
            transformWithHtmlBase(
              await renderTransforms(post.content, post.data.page, baseUrl),
              baseUrl,
            ),
          ),
        );
        return generateAtom({
          id: "tag:dnevnik.fabon.info,2026:feed",
          title: "fabon's blog",
          url: new URL("/feed.xml", baseUrl),
          updatedAt: Temporal.Now.instant(),
          entries: posts.map((post, i) => {
            const date = zonedDateTimeFromPageDate(post.date);
            return {
              id: `tag:dnevnik.fabon.info,2026:entry:${date.toPlainDate().toString()}/${getSlug(post)}`,
              link: new URL(post.url, baseUrl),
              title: post.data.title,
              contentHtml: normalizedContents[i],
              updatedAt: date.toInstant(),
            };
          }),
        });
      }
    },
  );
  // cf. https://github.com/11ty/eleventy/issues/4194
  eleventyConfig.addDataExtension("ts", {
    async parser(contents: Buffer<ArrayBuffer>, filePath: string) {
      const hash = new Uint8Array(
        await crypto.subtle.digest({ name: "SHA-256" }, contents.buffer),
      ).toHex();
      const module = await import(`${filePath}?${new URLSearchParams({ hash })}`);
      return module.default;
    },
    encoding: null,
  });
}

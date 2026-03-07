import "temporal-polyfill-lite/global";
import { rm } from "node:fs/promises";
import { fromAsyncCodeToHtml } from "@shikijs/markdown-it/async";
import { VentoPlugin } from "eleventy-plugin-vento";
import { createMarkdownExit } from "markdown-exit";
import { codeToHtml } from "shiki";
import { parsePageDate } from "./lib/temporal.ts";

const md = createMarkdownExit();
md.use(fromAsyncCodeToHtml(codeToHtml, { theme: "nord" }));

export default async function (eleventyConfig: any) {
  eleventyConfig.addPlugin(VentoPlugin);

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
}

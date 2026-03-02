import { rm } from "node:fs/promises";
import { fromAsyncCodeToHtml } from "@shikijs/markdown-it/async";
import { createMarkdownExit } from "markdown-exit";
import { codeToHtml } from "shiki";

const md = createMarkdownExit();
md.use(fromAsyncCodeToHtml(codeToHtml, { theme: "vitesse-light" }));

export default async function (eleventyConfig) {
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.on("eleventy.before", async ({ dir }) => {
    await rm(dir.output, { recursive: true, force: true });
  });
  eleventyConfig.addPreprocessor("drafts", "*", (data) => {
    if (process.env.ELEVENTY_RUN_MODE === "build" && data.draft) {
      return false;
    }
  });
  eleventyConfig.addCollection("posts", (collectionsApi) =>
    collectionsApi.getFilteredByGlob("src/posts/*.md"),
  );
  eleventyConfig.addExtension("md", {
    async compile(input) {
      return async () => await md.renderAsync(input);
    },
  });
}

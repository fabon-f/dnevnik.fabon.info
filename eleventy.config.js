import { rm } from "node:fs/promises";
import shiki from "@shikijs/markdown-it";

const shikiPlugin = await shiki({
  theme: "vitesse-light",
});

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
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(shikiPlugin));
}

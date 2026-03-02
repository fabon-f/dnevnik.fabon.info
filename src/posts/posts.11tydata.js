import * as v from "valibot";

export default {
  layout: "layouts/base.njk",
  permalink(data) {
    const slug = data.slug ?? data.page.fileSlug.replace(/\d+\./, "");
    if (data.draft) {
      return `/drafts/${slug}/`;
    }
    const date = data.page.date;
    return `/posts/${date.getUTCFullYear()}/${(date.getUTCMonth() + 1).toString().padStart(2, "0")}/${date.getUTCDate().toString().padStart(2, "0")}/${slug}/`;
  },
  eleventyDataSchema(data) {
    const schema = v.union([
      v.object({ draft: v.literal(true) }),
      v.object({ draft: v.optional(v.literal(false)), title: v.string(), date: v.date() }),
    ]);
    v.parse(schema, data);
  },
};

import * as v from "valibot";
import { getSlug } from "../../lib/data.ts";
import { zonedDateTimeFromPageDate } from "../../lib/temporal.ts";

export default {
  layout: "layouts/article.vto",
  og: {
    type: "article",
  },
  permalink(data: any) {
    const slug = getSlug(data);
    if (data.draft) {
      return `/drafts/${slug}/`;
    }
    return `/posts/${zonedDateTimeFromPageDate(data.page.date).toPlainDate().toString().replaceAll("-", "/")}/${slug}/`;
  },
  eleventyDataSchema(data: unknown) {
    const schema = v.union([
      v.object({ draft: v.literal(true) }),
      v.object({
        draft: v.optional(v.literal(false)),
        title: v.string(),
        date: v.union([v.date(), v.string()]),
      }),
    ]);
    v.parse(schema, data);
  },
};

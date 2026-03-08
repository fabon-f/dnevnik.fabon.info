interface FeedInfo {
  id: string;
  title: string;
  updatedAt: Temporal.Instant;
  url: URL;
  entries: FeedEntry[];
}

interface FeedEntry {
  id: string;
  title: string;
  link: URL;
  summary?: string;
  contentHtml: string;
  updatedAt: Temporal.Instant;
}

function escape(str: string) {
  return str.replaceAll(
    /[<>&'"\t\n\r]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        [`"`]: "&quot;",
        "\t": "&#9;",
        "\n": "&#10;",
        "\r": "&#13;",
      })[char]!,
  );
}

export function generateAtom(feed: FeedInfo) {
  const parts = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<feed xmlns="http://www.w3.org/2005/Atom">`,
  ];
  parts.push(`<id>${feed.id}</id>`);
  parts.push(`<title>${escape(feed.title)}</title>`);
  parts.push(`<author><name>fabon</name></author>`);
  parts.push(`<link rel="self" type="application/atom+xml" href="${escape(feed.url.href)}"/>`);
  parts.push(`<updated>${feed.updatedAt.toString()}</updated>`);
  for (const entry of feed.entries) {
    parts.push(`<entry>`);
    parts.push(`<id>${entry.id}</id>`);
    parts.push(`<title>${escape(entry.title)}</title>`);
    parts.push(`<link href="${escape(entry.link.href)}" />`);
    parts.push(`<content type="html">${escape(entry.contentHtml)}</content>`);
    parts.push(`<updated>${entry.updatedAt.toString()}</updated>`);
    if (entry.summary !== undefined) {
      parts.push(`<summary>${escape(entry.summary)}</content>`);
    }
    parts.push(`</entry>`);
  }
  parts.push(`</feed>`);
  return parts.join("");
}

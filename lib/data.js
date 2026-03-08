/**
 * @returns string
 */
export function getSlug(data) {
  return data.slug ?? data.page.fileSlug.replace(/^\d+\./, "");
}

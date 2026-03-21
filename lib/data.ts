export function getSlug(data: any): string {
  return data.slug ?? data.page.fileSlug.replace(/^\d+\./, "");
}

/**
 * URL-safe slug from arbitrary text: lowercase, strip diacritics, collapse any
 * run of non-alphanumeric characters to a single hyphen, trim leading/trailing
 * hyphens. Shared by the Projects collection hook and the backfill script so
 * both derive slugs identically.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Convert Squarespace `mainContent` HTML into clean, trimmed text lines.
 *
 * Block-level boundaries (</p>, <br>, </div>, headings, list items) become
 * newlines; all other tags are stripped; common HTML entities are decoded.
 */

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&nbsp;': ' ',
  '&#39;': "'",
  '&apos;': "'",
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
  '&rsquo;': "'",
  '&lsquo;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
  '&copy;': '©',
}

function decodeEntities(input: string): string {
  let out = input
  for (const [entity, char] of Object.entries(ENTITIES)) {
    out = out.split(entity).join(char)
  }
  // numeric entities (decimal + hex)
  out = out.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  out = out.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  return out
}

/** Full decoded plain text of the HTML (newlines preserved), for verification. */
export function htmlToText(html: string): string {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|br|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .split('\n')
    .map((line) => decodeEntities(line).replace(/[ \t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/** Decoded HTML split into trimmed, non-empty lines. */
export function htmlToLines(html: string): string[] {
  return htmlToText(html)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

/**
 * Flatten a Payload Lexical rich-text value to plain text, for meta
 * descriptions and JSON-LD (which want a short string, not markup). Walks the
 * serialized node tree collecting `text` leaves, inserting a space between
 * block-level nodes so words don't run together.
 */
export function lexicalToPlainText(data: unknown): string {
  const root = (data as { root?: { children?: unknown[] } } | null)?.root
  if (!root?.children) return ''

  const walk = (node: any): string => {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    const children = Array.isArray(node.children) ? node.children.map(walk).join('') : ''
    // Block-level nodes (paragraphs, headings, list items) get a trailing space.
    const isBlock = node.type && node.type !== 'text' && node.type !== 'linebreak'
    return isBlock ? `${children} ` : children
  }

  return root.children
    .map(walk)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Plain-text excerpt clipped to `max` chars on a word boundary, with an ellipsis. */
export function excerpt(data: unknown, max = 160): string {
  const text = lexicalToPlainText(data)
  if (text.length <= max) return text
  const clipped = text.slice(0, max)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`
}

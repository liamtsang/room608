/**
 * Canonical site origin, used for canonical URLs, OpenGraph tags, JSON-LD, and
 * the sitemap. Set SITE_URL (no trailing slash) in the environment; falls back
 * to localhost for dev. Trailing slashes are normalized off.
 *
 * Deliberately NOT prefixed NEXT_PUBLIC_: those are inlined at build time, so a
 * value set only in the Worker's runtime `vars` would never take effect. This
 * is read server-side at request time (metadata/sitemap/robots/JSON-LD), so a
 * plain runtime var is both sufficient and correct.
 */
export function getSiteUrl(): string {
  const raw = process.env.SITE_URL?.trim()
  const base = raw && raw.length > 0 ? raw : 'http://localhost:3000'
  return base.replace(/\/+$/, '')
}

/**
 * Turn a possibly-relative path (e.g. Payload's `/api/media/file/foo.jpg`) into
 * an absolute URL against the site origin. Already-absolute http(s) URLs pass
 * through unchanged. Returns undefined for empty input so callers can omit the
 * field entirely (e.g. og:image) rather than emit a broken URL.
 */
export function absoluteUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${getSiteUrl()}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

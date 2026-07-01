/**
 * Phase A — scrape room608.com project pages into a reviewable JSON file.
 *
 * No DB access. Fetches each project page's Squarespace JSON (?format=json-pretty),
 * strips the mainContent HTML to text, and classifies lines into
 * title / synopsis / credits / attribution. Output:
 *   src/scripts/data/scraped-projects.json   (hand-review this before Phase B)
 *   src/scripts/data/raw/<slug>.json          (cached page JSON)
 *
 * Run: cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/scrape-projects.ts
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { htmlToLines, htmlToText } from './lib/html'
import { isCreditLine, parseCreditBlock, titleCaseName, type Credit } from './lib/parse-credits'

const SITE = 'https://room608.com'
const dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(dirname, 'data')
const RAW_DIR = path.join(DATA_DIR, 'raw')

// Slugs that are not project pages.
const SLUG_DENYLIST = new Set([
  'home',
  'about',
  'contact',
  'file-storage',
  'bio-file-storage',
  'map-file-storage',
  'portrait-photos',
  'our-work',
  'our-work_230628',
  'our-work_250801',
])

// Known DB projects → canonical title + match status, so the reviewable JSON is
// pre-populated with the exact titles Phase B matches on. (From room608-backup.sql.)
const KNOWN: Record<string, string> = {
  deadlock: 'Breaking the Deadlock',
  'a-trip-to-infinity': 'A Trip to Infinity',
  'dr-tony-fauci': 'Dr. Tony Fauci',
  headspace: 'Headspace Guide to Meditation',
  'decoding-watson': 'Decoding Watson',
  'history-of-white-people-in-america': 'The History of White People in America',
  'beyond-a-year-in-space': 'Beyond A Year in Space',
  'a-year-in-space': 'A Year in Space',
  'faces-of-death': 'Faces of Death',
  'the-day-the-60s-died': "The Day the '60s Died",
  'times-square-time-machine': 'Times Square Time Machine',
  curious: 'Curious',
  'the-cave': 'The Cave',
  'buried-in-burma': 'Buried in Burma',
  jax: 'Turning Science Into Cures - The Jackson Laboratory',
  'inside-death-row': 'Inside Death Row',
  'how-to-build-a-beating-heart': 'How to Build a Beating Heart',
  'inside-guantanamo': 'Inside Guantanamo',
  'gorilla-murders': 'Gorilla Murders',
  'journey-to-an-alien-moon': 'Journey to an Alien Moon',
  'moment-of-death': 'Moment of Death',
  'to-catch-a-smuggler': 'To Catch a Smuggler',
  'secret-lives-of-the-apostles': 'Secret Lives of the Apostles',
}
// Live project page that is missing from the DB → create in Phase B.
const NEW_SLUGS = new Set(['i-contain-multitudes'])

interface ScrapedProject {
  slug: string
  title: string
  scrapedTitle: string
  matchStatus: 'matched' | 'new' | 'unmatched'
  skip: boolean
  overwriteDescription: boolean
  scrapedDate: string | null
  vimeoUrl: string | null
  synopsisParagraphs: string[]
  credits: Credit[]
  attributionLines: string[]
  rawText: string
  warnings: string[]
}

function curl(url: string): string {
  return execFileSync('curl', ['-sk', '--max-time', '25', url], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
}

function curlRetry(url: string, attempts = 2): string {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const out = curl(url)
      if (out && out.trim().length > 0) return out
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr ?? new Error(`empty response from ${url}`)
}

function fetchSlugs(): string[] {
  const xml = curlRetry(`${SITE}/sitemap.xml`)
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const slugs = locs
    .map((u) => u.replace(/\/$/, '').split('/').pop() || '')
    .filter((s) => s && !SLUG_DENYLIST.has(s))
  // de-dupe, keep order
  return [...new Set(slugs)]
}

const JUNK_LINE = [
  /^Normal\s+\d/i,
  /^(Normal|0|false|true|EN-US|JA|X-NONE)$/,
  /\b(X-NONE|MicrosoftInternetExplorer|mso-)\b/,
  /watch the full (program|series|film|documentary)/i,
  /\bstream .* online\b/i,
  /\bwatch .* (online|on (youtube|vimeo|pbs))/i,
  /\bPBS\.org\b/i,
]

function isJunk(line: string): boolean {
  if (/^[\s.,;:–—•·-]*$/.test(line)) return true // punctuation/empty only
  return JUNK_LINE.some((re) => re.test(line))
}

/** A scrapedDate hint from the Squarespace page JSON, if any. */
function extractDate(json: any): string | null {
  const ts =
    json?.item?.publishOn ??
    json?.item?.addedOn ??
    json?.collection?.updatedOn ??
    json?.website?.contentModifiedOn ??
    null
  if (typeof ts !== 'number') return null
  try {
    return new Date(ts).toISOString().slice(0, 10)
  } catch {
    return null
  }
}

/** Extract the Vimeo player URL (with privacy hash) from the page's mainContent HTML. */
function extractVimeoUrl(mainContent: string): string | null {
  const m = mainContent.match(/player\.vimeo\.com\/video\/(\d+)(?:\?(?:amp;)?h=([0-9a-f]+))?/i)
  if (!m) return null
  const [, id, hash] = m
  return hash
    ? `https://player.vimeo.com/video/${id}?h=${hash}`
    : `https://player.vimeo.com/video/${id}`
}

function scrapeOne(slug: string): ScrapedProject {
  const rawPath = path.join(RAW_DIR, `${slug}.json`)
  let body: string
  if (fs.existsSync(rawPath)) {
    body = fs.readFileSync(rawPath, 'utf8')
  } else {
    body = curlRetry(`${SITE}/${slug}?format=json-pretty`)
    fs.writeFileSync(rawPath, body)
  }

  const json = JSON.parse(body)
  const mainContent: string = json.mainContent || ''
  const rawText = htmlToText(mainContent)
  const vimeoUrl = extractVimeoUrl(mainContent)

  const allLines = htmlToLines(mainContent)
  const scrapedTitle = allLines[0] || ''
  // drop title + junk
  const lines = allLines.slice(1).filter((l) => !isJunk(l))

  // synopsis = leading prose lines until the first credit-shaped line
  let boundary = lines.findIndex((l) => isCreditLine(l))
  if (boundary === -1) boundary = lines.length
  const synopsisParagraphs = lines.slice(0, boundary)
  const creditLines = lines.slice(boundary)

  const { credits, leftover, warnings } = parseCreditBlock(creditLines)
  if (synopsisParagraphs.length === 0) warnings.push('no synopsis detected')
  if (credits.length === 0) warnings.push('no credits parsed')
  // multi-segment pages can push the real synopsis into the credit/attribution
  // region — flag long attribution lines for manual review.
  if (leftover.some((l) => l.length > 150))
    warnings.push('long attribution line — possible synopsis misplaced (review)')
  if (synopsisParagraphs.some((p) => p.length < 40 && !/[.!?]$/.test(p)))
    warnings.push('short synopsis line — possible heading (review)')
  if (!vimeoUrl) warnings.push('no Vimeo embed found')

  const matchStatus: ScrapedProject['matchStatus'] = KNOWN[slug]
    ? 'matched'
    : NEW_SLUGS.has(slug)
      ? 'new'
      : 'unmatched'
  const title =
    KNOWN[slug] ??
    (NEW_SLUGS.has(slug) ? titleCaseName(scrapedTitle) : titleCaseName(scrapedTitle))

  return {
    slug,
    title,
    scrapedTitle,
    matchStatus,
    skip: matchStatus === 'unmatched',
    overwriteDescription: false,
    scrapedDate: extractDate(json),
    vimeoUrl,
    synopsisParagraphs,
    credits,
    attributionLines: leftover,
    rawText,
    warnings,
  }
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true })

  const slugs = fetchSlugs()
  console.log(`Found ${slugs.length} candidate project slugs`)

  const results: ScrapedProject[] = []
  for (const slug of slugs) {
    try {
      const r = scrapeOne(slug)
      results.push(r)
      const flag = r.warnings.length ? `  ⚠ ${r.warnings.join('; ')}` : ''
      console.log(
        `  ${r.matchStatus.padEnd(9)} ${slug.padEnd(38)} ` +
          `syn:${r.synopsisParagraphs.length} credits:${r.credits.length} attr:${r.attributionLines.length}${flag}`,
      )
    } catch (err) {
      console.error(`  FAILED ${slug}: ${(err as Error).message}`)
    }
    // gentle on the flaky live site (skipped when served from cache)
    if (!fs.existsSync(path.join(RAW_DIR, `${slug}.json`))) {
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  results.sort((a, b) => a.title.localeCompare(b.title))
  const outPath = path.join(DATA_DIR, 'scraped-projects.json')
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2) + '\n')
  console.log(`\nWrote ${results.length} records → ${path.relative(process.cwd(), outPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

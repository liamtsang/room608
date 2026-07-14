/**
 * Phase B — import reviewed scraped-projects.json into Payload `projects`.
 *
 * Matches existing projects by title and updates `description` + `credits`
 * (leaving `date`, `images`, `awards`, `title` untouched); creates projects
 * marked `matchStatus: "new"`. Idempotent: credits/description are full
 * overwrites and creates re-find by title first.
 *
 * Run:        cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/import-projects.ts
 * Dry run:    DRY_RUN=1 cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/import-projects.ts
 *
 * (Dry-run is an env var, not a CLI flag: payload.config.ts maps realpath() over
 * process.argv and chokes on non-path arguments.)
 */

import 'dotenv/config' // load PAYLOAD_SECRET from .env before payload.config reads it

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { getPayload } from 'payload'
import config from '@payload-config'

import { buildDescription } from './lib/lexical'
import { isCreditLine, type Credit } from './lib/parse-credits'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'

interface ScrapedProject {
  slug: string
  title: string
  matchStatus: 'matched' | 'new' | 'unmatched'
  skip: boolean
  overwriteDescription: boolean
  scrapedDate: string | null
  date?: string | null
  vimeoUrl?: string | null
  synopsisParagraphs: string[]
  credits: Credit[]
  warnings: string[]
}

/** Flatten a Lexical richText value to plain text lines (per paragraph). */
function lexicalToLines(value: any): string[] {
  const root = value?.root
  if (!root?.children) return []
  return root.children
    .map((node: any) =>
      (node.children || [])
        .map((c: any) => c.text || '')
        .join('')
        .trim(),
    )
    .filter((line: string) => line.length > 0)
}

/** A description is "jammed" if any of its paragraphs reads like a credit line. */
function isJammedDescription(value: any): boolean {
  return lexicalToLines(value).some((line) => isCreditLine(line))
}

async function main() {
  const inputPath = process.env.INPUT
    ? path.resolve(process.env.INPUT)
    : path.join(dirname, 'data', 'scraped-projects.json')
  const records: ScrapedProject[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

  const payload = await getPayload({ config: await config })

  let updated = 0
  let created = 0
  let skipped = 0
  const issues: string[] = []

  for (const rec of records) {
    if (rec.skip) {
      skipped++
      console.log(`  skip      ${rec.title}`)
      continue
    }

    const description = buildDescription(rec.synopsisParagraphs)
    const credits = rec.credits

    // find existing by exact title, then case-insensitive fallback
    let existing = (
      await payload.find({
        collection: 'projects',
        where: { title: { equals: rec.title } },
        limit: 2,
        depth: 0,
      })
    ).docs
    if (existing.length === 0) {
      const all = (
        await payload.find({
          collection: 'projects',
          where: { title: { like: rec.title } },
          limit: 5,
          depth: 0,
        })
      ).docs
      existing = all.filter(
        (d: any) => (d.title || '').trim().toLowerCase() === rec.title.trim().toLowerCase(),
      )
    }

    if (existing.length > 1) {
      issues.push(`AMBIGUOUS: ${existing.length} projects titled "${rec.title}" — skipped`)
      console.log(`  ambiguous ${rec.title} (${existing.length} matches)`)
      skipped++
      continue
    }

    if (existing.length === 1) {
      const doc: any = existing[0]
      const emptyDesc = lexicalToLines(doc.description).length === 0
      const jammed = isJammedDescription(doc.description)
      const writeDesc = description && (emptyDesc || jammed || rec.overwriteDescription)

      const data: any = { credits }
      if (writeDesc) data.description = description
      if (rec.vimeoUrl) data.vimeoUrl = rec.vimeoUrl

      const descNote = writeDesc
        ? jammed
          ? 'desc:overwrite(jammed)'
          : emptyDesc
            ? 'desc:fill'
            : 'desc:overwrite(flag)'
        : 'desc:keep'
      console.log(
        `  update    ${rec.title.padEnd(45)} credits:${credits.length} ${descNote}` +
          (rec.warnings.length ? `  ⚠ ${rec.warnings.join('; ')}` : ''),
      )

      if (!DRY_RUN) {
        await payload.update({ collection: 'projects', id: doc.id, data })
      }
      updated++
      continue
    }

    // no match → create (only for records explicitly marked new)
    if (rec.matchStatus !== 'new') {
      issues.push(`UNMATCHED: "${rec.title}" has no project and is not marked new — skipped`)
      console.log(`  unmatched ${rec.title}`)
      skipped++
      continue
    }

    const date = rec.date || rec.scrapedDate
    if (!date) {
      issues.push(`NO DATE: cannot create "${rec.title}" — add a "date" field in the JSON`)
      console.log(`  no-date   ${rec.title} (create needs a date)`)
      skipped++
      continue
    }

    console.log(`  CREATE    ${rec.title.padEnd(45)} credits:${credits.length} date:${date}`)
    if (!DRY_RUN) {
      await payload.create({
        collection: 'projects',
        data: {
          title: rec.title,
          date,
          description: description ?? undefined,
          credits,
          vimeoUrl: rec.vimeoUrl ?? undefined,
        } as any,
      })
    }
    created++
  }

  console.log(
    `\n${DRY_RUN ? '[dry-run] ' : ''}Done. updated:${updated} created:${created} skipped:${skipped}`,
  )
  if (issues.length) {
    console.log('\nIssues needing attention:')
    for (const i of issues) console.log(`  - ${i}`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

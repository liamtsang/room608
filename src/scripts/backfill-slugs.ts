/**
 * Backfill `slug` for existing projects that don't have one yet.
 *
 * The Projects collection's beforeValidate hook derives a unique slug from the
 * title, so this script just re-saves each slug-less project and lets the hook
 * do the work. Idempotent: projects that already have a slug are skipped.
 *
 * Local:  cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/backfill-slugs.ts
 * Remote: NODE_ENV=production REMOTE_D1=1 cross-env NODE_OPTIONS=--no-deprecation \
 *           tsx src/scripts/backfill-slugs.ts
 */
import 'dotenv/config' // load PAYLOAD_SECRET from .env before payload.config reads it

import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config: await config })

  const { docs } = await payload.find({
    collection: 'projects',
    limit: 0,
    depth: 0,
  })

  let updated = 0
  for (const project of docs) {
    if (project.slug) {
      console.log(`skip #${project.id} "${project.title}" (slug: ${project.slug})`)
      continue
    }
    // Re-save with the current title; the beforeValidate hook fills in a unique slug.
    const saved = await payload.update({
      collection: 'projects',
      id: project.id,
      data: { title: project.title },
    })
    console.log(`slug #${saved.id} "${saved.title}" → ${saved.slug}`)
    updated++
  }

  console.log(`\nDone. ${updated} project(s) updated, ${docs.length - updated} already had a slug.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

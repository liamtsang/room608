/**
 * Attach the laser-scan hover video to the "A Trip to Infinity" project.
 *
 * Uploads scan.mp4 (repo root) to the media collection (local R2 in dev) and
 * sets it as the project's `scanEffect`. Idempotent-ish: re-running creates a
 * new media doc each time and repoints the project.
 *
 * Run: cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/attach-scan-effect.ts
 */
import 'dotenv/config' // load PAYLOAD_SECRET from .env before payload.config reads it

import fs from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'
import config from '@payload-config'

const PROJECT_TITLE = process.env.PROJECT_TITLE || 'A Trip to Infinity'
const VIDEO_PATH = path.resolve(process.cwd(), process.env.VIDEO || 'scan.mp4')

async function main() {
  const payload = await getPayload({ config: await config })

  // NOTE: run with NODE_ENV=development so @payloadcms/storage-r2 wraps the
  // upload in a Blob — a raw Node Buffer fails to cross the wrangler platform
  // proxy to local R2 (cloudflare/workers-sdk#6047).
  const buffer = fs.readFileSync(VIDEO_PATH)
  const media = await payload.create({
    collection: 'media',
    data: { alt: `${PROJECT_TITLE} laser scan` },
    file: {
      data: buffer,
      mimetype: 'video/mp4',
      name: path.basename(VIDEO_PATH),
      size: buffer.length,
    },
  })
  console.log(`media #${media.id} → ${media.url}`)

  const { docs } = await payload.find({
    collection: 'projects',
    where: { title: { equals: PROJECT_TITLE } },
    limit: 1,
  })
  if (!docs.length) throw new Error(`project not found: ${PROJECT_TITLE}`)

  const project = docs[0]
  await payload.update({
    collection: 'projects',
    id: project.id,
    data: { scanEffect: media.id },
  })
  console.log(`attached scanEffect to project #${project.id} "${project.title}"`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

/**
 * Initialize the local D1 schema by booting Payload once (its dev-mode schema
 * push creates all tables/indexes). Run against an EMPTY local D1, then load
 * data-only INSERTs on top. See README in plan.
 *
 * Run: PAYLOAD_SECRET=local-import cross-env NODE_OPTIONS=--no-deprecation tsx src/scripts/warmup-db.ts
 */
import 'dotenv/config' // load PAYLOAD_SECRET from .env before payload.config reads it

import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  await getPayload({ config: await config })
  console.log('Schema initialized.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

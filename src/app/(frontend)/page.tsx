import { getPayload } from 'payload'
import config from '@/payload.config'
import { Workspace } from './Workspace'
import './styles.css'

// Render at request time against the live D1 (not prerendered at build). This
// keeps `next build` from connecting to the database — avoiding the dev-mode
// migration prompt — and lets CMS edits appear without a redeploy.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: projects } = await payload.find({
    collection: 'projects',
    sort: '-date',
    depth: 1,
    limit: 0,
  })

  return (
    <div className="dot-grid-bg w-full h-full">
      <Workspace projects={projects} />
    </div>
  )
}

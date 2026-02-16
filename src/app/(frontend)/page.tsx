import { getPayload } from 'payload'
import config from '@/payload.config'
import { Workspace } from './Workspace'
import './styles.css'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: projects } = await payload.find({
    collection: 'projects',
    sort: '-date',
    depth: 1,
  })

  return <Workspace projects={projects} />
}

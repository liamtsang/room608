import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getSiteUrl } from '@/lib/site'

// Built at request time so it never touches D1 during `next build` and always
// reflects the current set of projects.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl()
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'projects',
    limit: 0,
    depth: 0,
    sort: '-date',
  })

  const projectEntries: MetadataRoute.Sitemap = docs
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${site}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    }))

  return [
    { url: `${site}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/about` },
    { url: `${site}/sitemap` },
    ...projectEntries,
  ]
}

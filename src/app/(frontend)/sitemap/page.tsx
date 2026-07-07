import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { MobileNav } from '../components/MobileNav'

// Request-time render so the list stays in sync with the projects collection.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All projects — Room 608',
  description: 'Index of every Room 608 film and series.',
}

export default async function SitemapPage() {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'projects',
    limit: 0,
    depth: 0,
    sort: '-date',
  })
  const projects = docs.filter((p) => p.slug)

  return (
    <div className="dot-grid-bg min-h-screen text-black">
      <MobileNav />
      <div className="mx-auto max-w-3xl p-4 md:p-8 md:pt-24">
        <h1 className="mb-4 text-2xl font-bold">All projects</h1>
        <ul className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md divide-y divide-[#3D3D3D]/30">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.slug}`} className="block p-3 underline hover:bg-[#b3a488]">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
        {projects.length === 0 && <p className="opacity-60">No projects yet.</p>}
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { MobileNav } from '../components/MobileNav'

// Request-time render so the list stays in sync with the projects collection.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sitemap — Room 608',
  description: 'Index of every page on room608.nyc.',
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
      <div className="mx-auto max-w-3xl p-4 font-mono text-xs leading-5 md:p-8 md:pt-24">
        <p className="mb-2">room608.nyc</p>
        <ul>
          <li>
            <span className="select-none whitespace-pre">├── </span>
            <Link href="/" className="underline hover:no-underline">
              Home
            </Link>
          </li>
          <li>
            <span className="select-none whitespace-pre">├── </span>
            <Link href="/about" className="underline hover:no-underline">
              About
            </Link>
          </li>
          <li>
            <span className="select-none whitespace-pre">└── </span>Projects
            <ul>
              {projects.map((p, i) => (
                <li key={p.id}>
                  <span className="select-none whitespace-pre">
                    {'    '}
                    {i === projects.length - 1 ? '└── ' : '├── '}
                  </span>
                  <Link href={`/projects/${p.slug}`} className="underline hover:no-underline">
                    {p.title}
                  </Link>
                </li>
              ))}
              {projects.length === 0 && (
                <li>
                  <span className="select-none whitespace-pre">{'    '}└── </span>
                  <span className="opacity-60">(none yet)</span>
                </li>
              )}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  )
}

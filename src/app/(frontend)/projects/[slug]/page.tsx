import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { RichText } from '@payloadcms/richtext-lexical/react'
import config from '@/payload.config'
import type { Media, Project } from '@/payload-types'
import { getSiteUrl, absoluteUrl } from '@/lib/site'
import { excerpt } from '@/lib/lexical'
import { awardLabel } from '@/lib/awards'
import '../../styles.css'

// Render at request time against live D1 (same rationale as the homepage: keep
// `next build` from touching the database, and reflect CMS edits without a redeploy).
export const dynamic = 'force-dynamic'

// Deduped across generateMetadata + the page render within a single request.
const getProject = cache(async (slug: string): Promise<Project | null> => {
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })
  return docs[0] ?? null
})

function projectImages(project: Project): Media[] {
  return (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Not found — Room 608' }

  const description =
    excerpt(project.description) ||
    `${project.title}${creditLine(project) ? ` — ${creditLine(project)}` : ''}`
  const ogImage = absoluteUrl(projectImages(project)[0]?.url)
  const url = `${getSiteUrl()}/projects/${project.slug}`

  return {
    metadataBase: new URL(getSiteUrl()),
    title: `${project.title} — Room 608`,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: 'video.other',
      title: project.title,
      description,
      url,
      siteName: 'Room 608',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

/** Short "Director Name, Producer Name" style line for fallbacks. */
function creditLine(project: Project): string {
  return (project.credits ?? [])
    .slice(0, 3)
    .map((c) => c.name)
    .join(', ')
}

/** schema.org CreativeWork with credits mapped to people so the work is tied to its creators. */
function jsonLd(project: Project) {
  const credits = project.credits ?? []
  const person = (name: string) => ({ '@type': 'Person', name })
  // Unique names for a role predicate, preserving first-seen order.
  const namesByRole = (match: (role: string) => boolean) => [
    ...new Set(credits.filter((c) => match(c.role.toLowerCase())).map((c) => c.name)),
  ]

  const directorNames = namesByRole((r) => r.includes('director'))
  const producerNames = namesByRole((r) => r.includes('producer'))
  const credited = new Set([...directorNames, ...producerNames])
  // Everyone else, minus anyone already listed as a director/producer.
  const contributorNames = [
    ...new Set(
      credits
        .map((c) => c.name)
        .filter((name) => {
          const roles = credits.filter((c) => c.name === name).map((c) => c.role.toLowerCase())
          return !credited.has(name) && !roles.some((r) => r.includes('director') || r.includes('producer'))
        }),
    ),
  ]

  const director = directorNames.map(person)
  const producer = producerNames.map(person)
  const contributor = contributorNames.map(person)

  const images = projectImages(project)
    .map((img) => absoluteUrl(img.url))
    .filter((u): u is string => Boolean(u))

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    url: `${getSiteUrl()}/projects/${project.slug}`,
    description: excerpt(project.description, 500) || undefined,
  }
  if (project.date) data.datePublished = new Date(project.date).toISOString().slice(0, 10)
  if (images.length) data.image = images
  if (director.length) data.director = director
  if (producer.length) data.producer = producer
  if (contributor.length) data.contributor = contributor
  const awards = (project.awards ?? []).map((a) =>
    a.details ? `${awardLabel(a.type)} — ${a.details}` : awardLabel(a.type),
  )
  if (awards.length) data.award = awards
  return data
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const images = projectImages(project)
  const credits = project.credits ?? []
  const awards = project.awards ?? []

  return (
    <div className="dot-grid-bg min-h-screen w-full overflow-y-auto text-black">
      {/* Structured data: strongest signal tying creators' names to this work. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(project)) }}
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 md:p-8">
        <nav className="text-sm">
          <Link href="/" className="underline">
            ← Room 608
          </Link>
        </nav>

        <header className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-4">
          <h1 className="text-2xl font-bold md:text-3xl">{project.title}</h1>
        </header>

        {project.vimeoUrl && (
          <div className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-2">
            <div className="relative aspect-video overflow-hidden border border-white outline-2 outline-[#3D3D3D]">
              <iframe
                src={project.vimeoUrl}
                title={project.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        )}

        {credits.length > 0 && (
          <section
            aria-label="Credits"
            className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-4"
          >
            <h2 className="mb-2 font-bold">Credits</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {credits.map((c, i) => (
                <div key={i} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="font-semibold">{c.role}</dt>
                  <dd>{c.name}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {project.description && (
          <section className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-4">
            <RichText data={project.description} />
          </section>
        )}

        {awards.length > 0 && (
          <section
            aria-label="Awards"
            className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-4"
          >
            <h2 className="mb-2 font-bold">Awards</h2>
            <ul className="list-disc pl-5">
              {awards.map((a, i) => (
                <li key={i}>
                  {awardLabel(a.type)}
                  {a.details ? ` — ${a.details}` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}

        {images.length > 0 && (
          <section aria-label="Images" className="flex flex-col gap-3">
            {images.map((img) =>
              img.url ? (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt ?? project.title}
                  className="w-full border border-white outline-2 outline-[#3D3D3D]"
                />
              ) : null,
            )}
          </section>
        )}
      </div>
    </div>
  )
}

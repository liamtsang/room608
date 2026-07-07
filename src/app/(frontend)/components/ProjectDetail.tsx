'use client'

import { motion } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

function directorName(project: Project): string {
  const credits = project.credits ?? []
  return (
    credits.find((c) => c.role.toLowerCase() === 'director')?.name ?? credits[0]?.name ?? '—'
  )
}

export function ProjectDetail({ project }: { project: Project }) {
  const thumb = firstImage(project)
  const director = directorName(project)

  return (
    <motion.div
      key={`detail-${project.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="absolute inset-0 grid place-items-center p-8 pointer-events-none"
    >
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] pointer-events-auto">
        <div className="flex flex-col gap-3">
          <div className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-2">
            <div className="relative overflow-hidden border border-white outline-2 outline-[#3D3D3D] aspect-[16/9]">
              {thumb?.url ? (
                <img
                  src={thumb.url}
                  alt={thumb.alt ?? project.title}
                  draggable={false}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="w-full h-full bg-[#b3a488]" />
              )}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-black/55 backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-3 grid grid-cols-[auto_1fr] gap-2">
            <div className="outline-1 outline-[#3D3D3D] p-2">Title</div>
            <div className="outline-1 outline-[#3D3D3D] p-2">{project.title}</div>
            <div className="outline-1 outline-[#3D3D3D] p-2">Director</div>
            <div className="outline-1 outline-[#3D3D3D] p-2">{director}</div>
          </div>

          {project.slug && (
            <a
              href={`/projects/${project.slug}`}
              className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-2 text-center font-bold underline"
            >
              Open page ↗
            </a>
          )}
        </div>

        <div className="bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-4 max-h-[80vh] overflow-y-auto">
          {project.description ? (
            <RichText data={project.description} />
          ) : (
            <p className="opacity-60">No description.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

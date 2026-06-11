'use client'

import { AnimatePresence, motion } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'
import { useViewfinder } from './ViewfinderContext'

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

function directorName(project: Project): string {
  const credits = project.credits ?? []
  return credits.find((c) => c.role.toLowerCase() === 'director')?.name ?? credits[0]?.name ?? '—'
}

// Shared look for a populated info cell — a translucent cream panel that
// captures pointer events (so its contents stay scrollable/clickable) while
// the surrounding empty cells let clicks fall through to the conveyor.
const panelClass =
  'pointer-events-auto bg-[#C6B79C]/95 outline-1 outline-[#3D3D3D] w-full h-full overflow-hidden'

function InfoCell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className={panelClass}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

// Returns the content for a given 3x3 cell index when a project is selected.
// Grid index map:  0 1 2 / 3 4 5 / 6 7 8
function cellContent(project: Project, onClose: () => void, index: number) {
  const img = firstImage(project)
  switch (index) {
    case 1: // top-center — title
      return (
        <InfoCell>
          <div className="h-full flex flex-col justify-center p-4">
            <div className="text-lg font-bold leading-tight">{project.title}</div>
            <div className="text-xs opacity-70 mt-1">{directorName(project)}</div>
          </div>
        </InfoCell>
      )
    case 2: // top-right — close
      return (
        <div className="w-full h-full flex items-start justify-end p-2 pointer-events-none">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="pointer-events-auto bg-[#282828] text-white border-1 border-[#C6B79C] outline-1 outline-black px-2 py-1 font-bold"
          >
            ✕
          </button>
        </div>
      )
    case 3: // center-left — credits
      return (
        <InfoCell>
          <div className="h-full overflow-y-auto p-3 text-xs flex flex-col gap-1">
            {(project.credits ?? []).map((c, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="opacity-70">{c.role}</span>
                <span className="font-medium text-right">{c.name}</span>
              </div>
            ))}
          </div>
        </InfoCell>
      )
    case 4: // center — main image
      return (
        <InfoCell>
          {img?.url ? (
            <img
              src={img.url}
              alt={img.alt ?? project.title}
              draggable={false}
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="w-full h-full bg-[#b3a488]" />
          )}
        </InfoCell>
      )
    case 5: // center-right — description
      return (
        <InfoCell>
          {project.description && (
            <div className="h-full overflow-y-auto p-3 text-xs">
              <RichText data={project.description} />
            </div>
          )}
        </InfoCell>
      )
    default:
      return null
  }
}

export function Viewfinder() {
  const { selected, onClose } = useViewfinder()

  return (
    <div className="fixed inset-0 z-20 grid grid-cols-3 grid-rows-3 pointer-events-none">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="border-1 border-black relative overflow-hidden">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div key={selected.id} className="absolute inset-0">
                {cellContent(selected, onClose, i)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

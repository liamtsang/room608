'use client'

import { motion } from 'motion/react'
import type { Media, Project } from '@/payload-types'

const ROW_COPIES = 3

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

function Tile({ project, onSelect }: { project: Project; onSelect: (id: number) => void }) {
  const thumb = firstImage(project)
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(project.id)}
      whileHover={{ scale: 1.04, zIndex: 2 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer text-left shrink-0 h-full"
    >
      <div className="outline-1 outline-[#3D3D3D] p-2 flex flex-col gap-2 h-full">
        {thumb?.url ? (
          <div className="overflow-hidden border border-white outline-2 outline-[#3D3D3D] aspect-[16/9] h-full">
            <img
              src={thumb.url}
              alt={thumb.alt ?? project.title}
              draggable={false}
              className="w-full h-full object-cover select-none"
            />
          </div>
        ) : (
          <div className="border border-white outline-2 outline-[#3D3D3D] bg-[#b3a488] aspect-[16/9] h-full" />
        )}
        {/*<div className="outline-1 outline-[#3D3D3D] px-2 py-1 text-xs truncate">
          {project.title}
        </div>*/}
      </div>
    </motion.button>
  )
}

function ConveyorRow({
  projects,
  direction,
  duration,
  onSelect,
}: {
  projects: Project[]
  direction: 'ltr' | 'rtl'
  duration: number
  onSelect: (id: number) => void
}) {
  if (projects.length === 0) return null
  const items: Project[] = []
  for (let i = 0; i < ROW_COPIES; i++) items.push(...projects)
  // Animate by exactly one copy's width. The duplicated content makes the
  // loop-restart boundary invisible — the same tiles reappear in sequence.
  const oneCopy = `${-100 / ROW_COPIES}%`
  const keyframes = direction === 'ltr' ? [oneCopy, '0%'] : ['0%', oneCopy]
  return (
    <div className="overflow-hidden h-1/4">
      <motion.div
        className="flex gap-4 w-max h-full"
        animate={{ x: keyframes }}
        transition={{ duration, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
      >
        {items.map((p, i) => (
          <Tile key={`${p.id}-${i}`} project={p} onSelect={onSelect} />
        ))}
      </motion.div>
    </div>
  )
}

export function ProjectConveyor({
  projects,
  onSelect,
}: {
  projects: Project[]
  onSelect: (id: number) => void
}) {
  if (projects.length === 0) return null

  // Slice projects into rows in snake order. Mobile uses a different layout
  // entirely (Workspace.tsx mobile branch), so this targets desktop.
  const rowCount = 3
  const perRow = Math.ceil(projects.length / rowCount)
  const rows: Project[][] = []
  for (let r = 0; r < rowCount; r++) {
    const slice = projects.slice(r * perRow, (r + 1) * perRow)
    if (slice.length > 0) rows.push(slice)
  }

  return (
    <div className="flex h-full flex-col justify-center gap-4 py-4">
      {rows.map((rowProjects, i) => (
        <ConveyorRow
          key={i}
          projects={rowProjects}
          direction={i % 2 === 0 ? 'ltr' : 'rtl'}
          duration={Math.max(20, rowProjects.length * 6)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

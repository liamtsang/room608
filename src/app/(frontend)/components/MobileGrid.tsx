'use client'

import { motion } from 'motion/react'
import type { Media, Project } from '@/payload-types'

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

interface MobileGridProps {
  projects: Project[]
  onSelect: (id: number) => void
}

export function MobileGrid({ projects, onSelect }: MobileGridProps) {
  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="grid grid-cols-2 gap-3 p-3 pt-20 pb-8">
        {projects.map((project, i) => (
          <MobileGridItem key={project.id} project={project} index={i} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function MobileGridItem({
  project,
  index: _index,
  onSelect,
}: {
  project: Project
  index: number
  onSelect: (id: number) => void
}) {
  const thumb = firstImage(project)
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(project.id)}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer text-left"
    >
      <div className="p-1 flex flex-col gap-1">
        {thumb?.url ? (
          <div className="overflow-hidden border border-white outline-2 outline-[#3D3D3D] aspect-[16/9]">
            <img
              src={thumb.url}
              alt={thumb.alt ?? project.title}
              draggable={false}
              className="w-full h-full object-cover select-none"
            />
          </div>
        ) : (
          <div className="border border-white outline-2 outline-[#3D3D3D] bg-[#b3a488] aspect-[16/9]" />
        )}
      </div>
    </motion.button>
  )
}

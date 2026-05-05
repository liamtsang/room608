'use client'

import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Media, Project } from '@/payload-types'

const ROW_COPIES = 3
const WRAP_AT = 100 / ROW_COPIES
// Wheel deltas land in big discrete jumps; scale down per-tick step so the
// spring has room to smooth between events.
const WHEEL_STEP = 0.25
const SPRING = { stiffness: 60, damping: 20, mass: 0.6 }

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
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
  speed,
  scroll,
  onSelect,
}: {
  projects: Project[]
  direction: 'ltr' | 'rtl'
  speed: number
  scroll: MotionValue<number>
  onSelect: (id: number) => void
}) {
  const items: Project[] = []
  for (let i = 0; i < ROW_COPIES; i++) items.push(...projects)
  // Map accumulated scroll (px) to a wrapped percent offset within one copy's
  // width. Duplicated content makes the wrap boundary invisible.
  const x = useTransform(scroll, (v) => {
    const wrapped = mod(v * speed, WRAP_AT)
    return direction === 'ltr' ? `${wrapped - WRAP_AT}%` : `${-wrapped}%`
  })

  if (projects.length === 0) return null
  return (
    <div className="overflow-hidden h-1/4">
      <motion.div className="flex gap-4 w-max h-full" style={{ x }}>
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
  const scrollTarget = useMotionValue(0)
  const scroll = useSpring(scrollTarget, SPRING)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollTarget.set(scrollTarget.get() + (e.deltaY + e.deltaX) * WHEEL_STEP)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollTarget])

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
    <div ref={containerRef} className="flex h-full flex-col justify-center gap-4 py-4">
      {rows.map((rowProjects, i) => {
        // Longer rows wrap over a longer scroll distance so per-pixel visual
        // velocity stays roughly even across rows.
        const pxPerWrap = Math.max(1500, rowProjects.length * 300)
        return (
          <ConveyorRow
            key={i}
            projects={rowProjects}
            direction={i % 2 === 0 ? 'ltr' : 'rtl'}
            speed={WRAP_AT / pxPerWrap}
            scroll={scroll}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}

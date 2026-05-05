'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Media, Project } from '@/payload-types'

const ROW_COUNT = 3
const TILE_GAP = 16
// Wheel deltas land in big discrete jumps; scale down per-tick step so the
// spring has room to smooth between events.
const WHEEL_STEP = 0.25
const SPRING = { stiffness: 60, damping: 20, mass: 0.6 }
// Park hidden tiles far enough left that they can't bleed into a neighbour.
const OFFSCREEN = -99999

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
      className="cursor-pointer text-left h-full"
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
      </div>
    </motion.button>
  )
}

function PathTile({
  project,
  index,
  rowIdx,
  scroll,
  segLen,
  totalLen,
  itemSpacing,
  offPad,
  onSelect,
  innerRef,
}: {
  project: Project
  index: number
  rowIdx: number
  scroll: MotionValue<number>
  segLen: number
  totalLen: number
  itemSpacing: number
  offPad: number
  onSelect: (id: number) => void
  innerRef?: (el: HTMLDivElement | null) => void
}) {
  // Virtual position v walks a closed serpentine path of length totalLen,
  // split into ROW_COUNT segments of segLen each. When v crosses a segment
  // boundary the tile teleports to the next row at its off-screen edge —
  // invisible because the off-screen pad is wider than a tile.
  const x = useTransform(scroll, (s) => {
    if (segLen <= 0 || totalLen <= 0 || itemSpacing <= 0) return OFFSCREEN
    const v = mod(index * itemSpacing + s, totalLen)
    const itemRow = Math.floor(v / segLen)
    if (itemRow !== rowIdx) return OFFSCREEN
    const localV = v - itemRow * segLen
    const isLTR = rowIdx % 2 === 0
    return isLTR ? localV - offPad : segLen - localV - offPad
  })

  return (
    <motion.div
      ref={innerRef}
      style={{ x, position: 'absolute', top: 0, left: 0, height: '100%' }}
    >
      <Tile project={project} onSelect={onSelect} />
    </motion.div>
  )
}

export function ProjectConveyor({
  projects,
  onSelect,
}: {
  projects: Project[]
  onSelect: (id: number) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTarget = useMotionValue(0)
  const scroll = useSpring(scrollTarget, SPRING)

  const [rowEl, setRowEl] = useState<HTMLDivElement | null>(null)
  const [tileEl, setTileEl] = useState<HTMLDivElement | null>(null)
  const [rowWidth, setRowWidth] = useState(0)
  const [tileWidth, setTileWidth] = useState(0)

  useEffect(() => {
    if (!rowEl) return
    const update = () => setRowWidth(rowEl.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(rowEl)
    return () => ro.disconnect()
  }, [rowEl])

  useEffect(() => {
    if (!tileEl) return
    const update = () => setTileWidth(tileEl.getBoundingClientRect().width)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(tileEl)
    return () => ro.disconnect()
  }, [tileEl])

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

  const N = projects.length
  const tilePitch = tileWidth + TILE_GAP
  // Pack items tightly when N supports it; otherwise stretch to keep
  // off-screen pad >= tileWidth so row-to-row teleports stay invisible.
  const baseSegLen = (N * tilePitch) / ROW_COUNT
  const minSegLen = rowWidth + 2 * tileWidth
  const segLen = Math.max(baseSegLen, minSegLen)
  const totalLen = ROW_COUNT * segLen
  const itemSpacing = totalLen / N
  const offPad = (segLen - rowWidth) / 2

  return (
    <div ref={containerRef} className="flex h-full flex-col justify-center gap-4 py-4">
      {[0, 1, 2].map((rowIdx) => (
        <div
          key={rowIdx}
          ref={rowIdx === 0 ? setRowEl : undefined}
          className="overflow-hidden h-1/4 relative"
        >
          {projects.map((project, i) => (
            <PathTile
              key={project.id}
              project={project}
              index={i}
              rowIdx={rowIdx}
              scroll={scroll}
              segLen={segLen}
              totalLen={totalLen}
              itemSpacing={itemSpacing}
              offPad={offPad}
              onSelect={onSelect}
              innerRef={rowIdx === 0 && i === 0 ? setTileEl : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

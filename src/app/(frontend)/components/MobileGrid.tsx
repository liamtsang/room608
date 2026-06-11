'use client'

import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import type { Media, Project } from '@/payload-types'

const COLUMN_COUNT = 2
const TILE_GAP = 12
const TOUCH_STEP = 1
const WHEEL_STEP = 1.5
const SPRING = { stiffness: 158, damping: 28, mass: 0.4 }
// Multiplier on tileHeight for off-screen pad per column end. >= 1 keeps the
// column-to-column teleport hidden behind the column's overflow clip.
const PAD_FACTOR = 1
const OFFSCREEN_Y = -99999
const INTRO_DURATION = 4
const INTRO_EASE = [0.16, 1, 0.3, 1] as const

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function Tile({ project, onClick }: { project: Project; onClick: () => void }) {
  const thumb = firstImage(project)
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer text-left w-full block"
    >
      <div className="p-1 flex flex-col gap-1 w-full">
        {thumb?.url ? (
          <div className="overflow-hidden border border-white outline-2 outline-[#3D3D3D] aspect-[16/9] w-full">
            <img
              src={thumb.url}
              alt={thumb.alt ?? project.title}
              draggable={false}
              className="w-full h-full object-cover select-none"
            />
          </div>
        ) : (
          <div className="border border-white outline-2 outline-[#3D3D3D] bg-[#b3a488] aspect-[16/9] w-full" />
        )}
      </div>
    </motion.button>
  )
}

function PathTile({
  project,
  index,
  colIdx,
  scroll,
  introProgress,
  segLen,
  totalLen,
  itemSpacing,
  offPad,
  onSelect,
  innerRef,
}: {
  project: Project
  index: number
  colIdx: number
  scroll: MotionValue<number>
  introProgress: MotionValue<number>
  segLen: number
  totalLen: number
  itemSpacing: number
  offPad: number
  onSelect: (id: number) => void
  innerRef?: (el: HTMLDivElement | null) => void
}) {
  // Vertical analog of the desktop serpentine: virtual position v walks a
  // closed loop split into COLUMN_COUNT segments of segLen each. Left column
  // (colIdx 0) moves downward as v advances; right column (colIdx 1) moves
  // upward. Crossing a segment boundary teleports the tile to the next
  // column's off-screen edge — invisible because offPad >= tileHeight.
  const y = useTransform([scroll, introProgress], ([s, p]: number[]) => {
    if (segLen <= 0 || totalLen <= 0 || itemSpacing <= 0) return OFFSCREEN_Y
    let v = index * itemSpacing + s + (p - 1) * totalLen
    if (p >= 0.9999) v = mod(v, totalLen)
    const itemCol = Math.floor(v / segLen)
    if (itemCol !== colIdx) return OFFSCREEN_Y
    const localV = v - itemCol * segLen
    const isDown = colIdx % 2 === 0
    return isDown ? localV - offPad : segLen - localV - offPad
  })

  return (
    <motion.div
      ref={innerRef}
      style={{
        y,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
      }}
    >
      <Tile project={project} onClick={() => onSelect(project.id)} />
    </motion.div>
  )
}

interface MobileGridProps {
  projects: Project[]
  onSelect: (id: number) => void
}

export function MobileGrid({ projects, onSelect }: MobileGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const scrollTarget = useMotionValue(0)
  const scroll = useSpring(scrollTarget, SPRING)
  const introProgress = useMotionValue(0)
  const introStartedRef = useRef(false)

  const [colEl, setColEl] = useState<HTMLDivElement | null>(null)
  const [tileEl, setTileEl] = useState<HTMLDivElement | null>(null)
  const [columnHeight, setColumnHeight] = useState(0)
  const [tileHeight, setTileHeight] = useState(0)

  useEffect(() => {
    if (!colEl) return
    const update = () => setColumnHeight(colEl.clientHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(colEl)
    return () => ro.disconnect()
  }, [colEl])

  useEffect(() => {
    if (!tileEl) return
    const update = () => setTileHeight(tileEl.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(tileEl)
    return () => ro.disconnect()
  }, [tileEl])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let lastTouchY: number | null = null

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return
      lastTouchY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || lastTouchY == null) return
      e.preventDefault()
      const currentY = e.touches[0].clientY
      // Finger up → dy > 0 → advance loop (left col down, right col up).
      const dy = lastTouchY - currentY
      lastTouchY = currentY
      scrollTarget.set(scrollTarget.get() + dy * TOUCH_STEP)
    }

    const onTouchEnd = () => {
      lastTouchY = null
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollTarget.set(scrollTarget.get() + (e.deltaY + e.deltaX) * WHEEL_STEP)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
      el.removeEventListener('wheel', onWheel)
    }
  }, [scrollTarget])

  useEffect(() => {
    if (introStartedRef.current) return
    if (columnHeight <= 0 || tileHeight <= 0) return
    introStartedRef.current = true
    const controls = animate(introProgress, 1, {
      duration: INTRO_DURATION,
      ease: INTRO_EASE,
    })
    return () => controls.stop()
  }, [columnHeight, tileHeight, introProgress])

  if (projects.length === 0) return null

  const N = projects.length
  const tilePitch = tileHeight + TILE_GAP
  const baseSegLen = (N * tilePitch) / COLUMN_COUNT
  const minSegLen = columnHeight + 2 * tileHeight * PAD_FACTOR
  const segLen = Math.max(baseSegLen, minSegLen)
  const totalLen = COLUMN_COUNT * segLen
  const itemSpacing = totalLen / N
  const offPad = (segLen - columnHeight) / 2

  return (
    <div ref={containerRef} className="h-full overflow-hidden px-3" style={{ touchAction: 'none' }}>
      <div className="grid grid-cols-2 gap-3 h-full">
        {[0, 1].map((colIdx) => (
          <div
            key={colIdx}
            ref={colIdx === 0 ? setColEl : undefined}
            className="overflow-hidden relative h-full"
          >
            {projects.map((project, i) => (
              <PathTile
                key={project.id}
                project={project}
                index={i}
                colIdx={colIdx}
                scroll={scroll}
                introProgress={introProgress}
                segLen={segLen}
                totalLen={totalLen}
                itemSpacing={itemSpacing}
                offPad={offPad}
                onSelect={onSelect}
                innerRef={colIdx === 0 && i === 0 ? setTileEl : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

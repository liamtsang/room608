'use client'

import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  usePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { useDialKit } from 'dialkit'
import type { Media, Project } from '@/payload-types'

const ROW_COUNT = 3
const TILE_GAP = 16
// Wheel deltas land in big discrete jumps; scale down per-tick step so the
// spring has room to smooth between events.
const DEFAULT_WHEEL_STEP = 3
const DEFAULT_SPRING = { stiffness: 158, damping: 28, mass: 0.4 }
// Multiplier on tileWidth used as the minimum off-screen pad per row side.
// 1 = exactly one tile of off-screen pad (smooth row-to-row teleport).
const DEFAULT_PAD_FACTOR = 1
// Park hidden tiles far enough left that they can't bleed into a neighbour.
const OFFSCREEN = -99999
// Intro: tiles file along the serpentine path as if scrolled forward.
const INTRO_DURATION = 6
const INTRO_EASE = [0.16, 1, 0.3, 1] as const
// Slide-out detail panel motion.
const SLIDE_SPRING = { type: 'spring' as const, stiffness: 200, damping: 25 }

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

// Tint blended into the duplicate background image when faded. Adjust to
// taste — neutrals desaturate, hues recolor.
const FADE_TINT = '#C6B79C'

type CardStyle = { radius: number; borderWidth: number; borderColor: string }

function Tile({
  project,
  onClick,
  faded,
  card,
}: {
  project: Project
  onClick: () => void
  faded: boolean
  card: CardStyle
}) {
  const thumb = firstImage(project)
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01, zIndex: 2 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer text-left h-full"
    >
      <div className="p-2 flex flex-col gap-2 h-full">
        {thumb?.url ? (
          <motion.div
            className="overflow-hidden outline-1 aspect-[16/9] h-full relative"
            style={{
              borderRadius: card.radius,
              borderBottomStyle: 'solid',
              borderBottomWidth: card.borderWidth,
            }}
            animate={{
              outlineColor: faded ? `${card.borderColor}00` : `${card.borderColor}ff`,
              borderBottomColor: faded ? `${card.borderColor}00` : `${card.borderColor}ff`,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Color-blended bg layer, always at 50% opacity. */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${thumb.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: FADE_TINT,
                backgroundBlendMode: 'color',
                opacity: 0.5,
              }}
            />
            {/* Foreground image fades out to reveal the bg layer. Blend mode
                never changes, so the transition is smooth. */}
            <motion.img
              src={thumb.url}
              alt={thumb.alt ?? project.title}
              draggable={false}
              className="w-full h-full object-cover select-none relative"
              animate={{ opacity: faded ? 0 : 1 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </motion.div>
        ) : (
          <div
            className="outline-2 outline-[#3D3D3D] bg-[#b3a488] aspect-[16/9] h-full"
            style={{ borderRadius: card.radius }}
          />
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
  introProgress,
  segLen,
  totalLen,
  itemSpacing,
  offPad,
  rowWidth,
  tilePitch,
  verticalPitch,
  onSelect,
  onClose,
  selected,
  gridFaded,
  card,
  detailSpring,
  creditSpring,
  innerRef,
}: {
  project: Project
  index: number
  rowIdx: number
  scroll: MotionValue<number>
  introProgress: MotionValue<number>
  segLen: number
  totalLen: number
  itemSpacing: number
  offPad: number
  rowWidth: number
  tilePitch: number
  verticalPitch: number
  onSelect: (id: number) => void
  onClose?: () => void
  selected: boolean
  gridFaded: boolean
  card: CardStyle
  detailSpring: SpringOptions
  creditSpring: SpringOptions
  innerRef?: (el: HTMLDivElement | null) => void
}) {
  // Virtual position v walks a closed serpentine path of length totalLen,
  // split into ROW_COUNT segments of segLen each. When v crosses a segment
  // boundary the tile teleports to the next row at its off-screen edge —
  // invisible because the off-screen pad is wider than a tile.
  //
  // During intro (introProgress < 1), v is shifted by (p-1)*totalLen and
  // mod is skipped so tiles can sit at v < 0 (off-screen left of row 0)
  // and slide rightward into resting positions as if scrolled forward.
  const x = useTransform([scroll, introProgress], ([s, p]: number[]) => {
    if (segLen <= 0 || totalLen <= 0 || itemSpacing <= 0) return OFFSCREEN
    let v = index * itemSpacing + s + (p - 1) * totalLen
    if (p >= 0.9999) v = mod(v, totalLen)
    const itemRow = Math.floor(v / segLen)
    if (itemRow !== rowIdx) return OFFSCREEN
    const localV = v - itemRow * segLen
    const isLTR = rowIdx % 2 === 0
    return isLTR ? localV - offPad : segLen - localV - offPad
  })

  const tileFaded = gridFaded && !selected

  // While the panel is mounted (including its exit slide-back), keep the
  // tile above it so the panel slides back behind the image, not over it.
  const [panelMounted, setPanelMounted] = useState(false)
  useEffect(() => {
    if (selected) setPanelMounted(true)
  }, [selected])

  // When something is already selected, clicks on any tile close — never
  // open another. Without this, clicking a faded tile would simultaneously
  // close the current panel and open a new one.
  const handleTileClick = () => {
    if (gridFaded) onClose?.()
    else onSelect(project.id)
  }

  return (
    <>
      <AnimatePresence>
        {selected && rowWidth > 0 && tilePitch > 0 && (
          <SlidePanel
            key={`panel-${project.id}`}
            project={project}
            tileX={x}
            rowWidth={rowWidth}
            tilePitch={tilePitch}
            card={card}
            spring={detailSpring}
            onExitComplete={() => setPanelMounted(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selected && verticalPitch > 0 && (
          <VerticalPanel
            key={`vpanel-${project.id}`}
            project={project}
            tileX={x}
            verticalPitch={verticalPitch}
            card={card}
            spring={creditSpring}
            // top rows pop down, the bottom row pops up
            dir={rowIdx === ROW_COUNT - 1 ? -1 : 1}
          />
        )}
      </AnimatePresence>
      <motion.div
        ref={innerRef}
        style={{
          x,
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: panelMounted ? 2 : 0,
        }}
      >
        <Tile project={project} onClick={handleTileClick} faded={tileFaded} card={card} />
      </motion.div>
    </>
  )
}

// Slide-out detail panel: rides on the selected tile's x, plus an animated
// offset that springs to ±tilePitch (chosen by which side of the row the
// tile sits on) so the panel emerges from behind the tile into the next
// tile's slot. Uses usePresence to reverse the slide on exit.
function SlidePanel({
  project,
  tileX,
  rowWidth,
  tilePitch,
  card,
  spring,
  onExitComplete,
}: {
  project: Project
  tileX: MotionValue<number>
  rowWidth: number
  tilePitch: number
  card: CardStyle
  spring: SpringOptions
  onExitComplete?: () => void
}) {
  const [isPresent, safeToRemove] = usePresence()
  const [dir] = useState<1 | -1>(() => (tileX.get() + tilePitch / 2 < rowWidth / 2 ? 1 : -1))
  const offset = useMotionValue(0)
  const x = useTransform([tileX, offset], ([t, o]: number[]) => t + o)

  useEffect(() => {
    if (isPresent) {
      const ctrl = animate(offset, dir * tilePitch, spring)
      return () => ctrl.stop()
    }
    const ctrl = animate(offset, 0, spring)
    ctrl.then(() => {
      onExitComplete?.()
      safeToRemove?.()
    })
    return () => ctrl.stop()
  }, [isPresent, dir, tilePitch, offset, spring, safeToRemove, onExitComplete])

  return (
    <motion.div
      style={{
        x,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 1,
      }}
    >
      <DetailPanel project={project} card={card} />
    </motion.div>
  )
}

function directorName(project: Project): string {
  const credits = project.credits ?? []
  return credits.find((c) => c.role.toLowerCase() === 'director')?.name ?? credits[0]?.name ?? '—'
}

function DetailPanel({ project, card }: { project: Project; card: CardStyle }) {
  return (
    <div className="text-left h-full pointer-events-auto">
      <div className="p-2 flex flex-col gap-2 h-full">
        <div
          className="overflow-hidden outline outline-black aspect-[16/9] h-full bg-[#C6B79C] flex flex-col gap-2"
          style={{
            borderRadius: card.radius,
            borderBottomStyle: 'solid',
            borderBottomWidth: card.borderWidth,
            borderBottomColor: card.borderColor,
          }}
        >
          {project.description ? (
            <div className="text-sm flex-1 overflow-y-auto pr-1">
              <RichText data={project.description} />
            </div>
          ) : (
            <div className="text-xs opacity-60">No description.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Title/credits card that pops vertically out from behind the selected tile —
// down for the top rows, up for the bottom row. Mirrors SlidePanel's emerge-
// from-behind motion on the Y axis. Four boxed quadrants: label / value ×2.
function CreditCard({ project, dir, card }: { project: Project; dir: 1 | -1; card: CardStyle }) {
  // dir 1 = popping down → sit at the top of the slot (just below the tile);
  // dir -1 = popping up → sit at the bottom of the slot (just above the tile).
  return (
    <div className="text-left h-full pointer-events-none">
      <div
        className={`p-2 flex flex-col gap-2 h-full ${dir === 1 ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className="w-full bg-[#C6B79C] outline outline-black p-2 grid grid-cols-[auto_1fr] grid-rows-2 gap-2 content-center"
          style={{
            borderRadius: card.radius,
            borderBottomStyle: 'solid',
            borderBottomWidth: card.borderWidth,
            borderBottomColor: card.borderColor,
          }}
        >
          <div className="outline-1 outline-[#3D3D3D] px-3 py-2 text-sm text-center">Title</div>
          <div className="outline-1 outline-[#3D3D3D] px-3 py-2 text-sm max-w-[30ch]">
            {project.title}
          </div>
          <div className="outline-1 outline-[#3D3D3D] px-3 py-2 text-sm text-center">Director</div>
          <div className="outline-1 outline-[#3D3D3D] px-3 py-2 text-sm">
            {directorName(project)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Vertical analog of SlidePanel: rides on the selected tile's x (horizontal
// alignment), springs a y offset to ±verticalPitch so the credit card emerges
// from behind the tile into the adjacent row slot.
function VerticalPanel({
  project,
  tileX,
  verticalPitch,
  dir,
  card,
  spring,
  onExitComplete,
}: {
  project: Project
  tileX: MotionValue<number>
  verticalPitch: number
  dir: 1 | -1
  card: CardStyle
  spring: SpringOptions
  onExitComplete?: () => void
}) {
  const [isPresent, safeToRemove] = usePresence()
  const offsetY = useMotionValue(0)
  const x = useTransform(tileX, (t) => t)

  useEffect(() => {
    if (isPresent) {
      const ctrl = animate(offsetY, dir * verticalPitch, spring)
      return () => ctrl.stop()
    }
    const ctrl = animate(offsetY, 0, spring)
    ctrl.then(() => {
      onExitComplete?.()
      safeToRemove?.()
    })
    return () => ctrl.stop()
  }, [isPresent, dir, verticalPitch, offsetY, spring, safeToRemove, onExitComplete])

  return (
    <motion.div
      style={{
        x,
        y: offsetY,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 1,
        // Display-only card: let clicks fall through so the empty space above/
        // below it doesn't swallow click-to-close.
        pointerEvents: 'none',
      }}
    >
      <CreditCard project={project} dir={dir} card={card} />
    </motion.div>
  )
}

export function ProjectConveyor({
  projects,
  onSelect,
  onClose,
  selectedId = null,
}: {
  projects: Project[]
  onSelect: (id: number) => void
  onClose?: () => void
  selectedId?: number | null
}) {
  const gridFaded = selectedId != null
  const containerRef = useRef<HTMLDivElement | null>(null)

  const dials = useDialKit(
    'Conveyor',
    {
      motion: {
        wheelStep: [DEFAULT_WHEEL_STEP, 0.05, 10, 0.05],
        scrollSpring: { type: 'spring', ...DEFAULT_SPRING },
        padFactor: [DEFAULT_PAD_FACTOR, 0, 3, 0.05],
        detailSpring: { ...SLIDE_SPRING },
        creditSpring: { ...SLIDE_SPRING },
      },
      cards: {
        gap: [TILE_GAP, 0, 64, 1],
        radius: [6, 0, 32, 1], // rounded-md ≈ 6px
        borderWidth: [3, 0, 16, 1],
        borderColor: '#3d3d3d',
      },
      dots: {
        bg: '#cbbbb9',
        color: '#ad9f9d',
        size: [2, 0, 12, 1],
        space: [32, 4, 96, 1],
      },
    },
    { id: 'conveyor', persist: true }, // tweaks survive reloads
  )

  // Sync the dot-grid controls onto <body>, where .dot-grid-bg reads them.
  useEffect(() => {
    const s = document.body.style
    s.setProperty('--dot-bg', dials.dots.bg)
    s.setProperty('--dot-color', dials.dots.color)
    s.setProperty('--dot-size', `${dials.dots.size}px`)
    s.setProperty('--dot-space', `${dials.dots.space}px`)
  }, [dials.dots.bg, dials.dots.color, dials.dots.size, dials.dots.space])

  const scrollTarget = useMotionValue(0)
  const scroll = useSpring(scrollTarget, dials.motion.scrollSpring as SpringOptions)
  const introProgress = useMotionValue(0)
  const introStartedRef = useRef(false)

  const [rowEl, setRowEl] = useState<HTMLDivElement | null>(null)
  const [tileEl, setTileEl] = useState<HTMLDivElement | null>(null)
  const [rowWidth, setRowWidth] = useState(0)
  const [tileWidth, setTileWidth] = useState(0)
  const [tileHeight, setTileHeight] = useState(0)

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
    const update = () => {
      const rect = tileEl.getBoundingClientRect()
      setTileWidth(rect.width)
      setTileHeight(rect.height)
    }
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
      // Selection freezes the conveyor — wheel events are swallowed so the
      // detail panel stays anchored to its tile.
      if (selectedId != null) return
      scrollTarget.set(scrollTarget.get() + (e.deltaY + e.deltaX) * dials.motion.wheelStep)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollTarget, dials.motion.wheelStep, selectedId])

  // When selection happens, snap the spring's target to the current value so
  // any in-flight scroll motion stops drifting under the detail panel.
  useEffect(() => {
    if (selectedId != null) scrollTarget.set(scroll.get())
  }, [selectedId, scrollTarget, scroll])

  // Kick off the file-in intro once dimensions are known. introProgress 0→1
  // shifts every tile from off-screen left to its resting serpentine position.
  useEffect(() => {
    if (introStartedRef.current) return
    if (rowWidth <= 0 || tileWidth <= 0) return
    introStartedRef.current = true
    const controls = animate(introProgress, 1, {
      duration: INTRO_DURATION,
      ease: INTRO_EASE,
    })
    return () => controls.stop()
  }, [rowWidth, tileWidth, introProgress])

  if (projects.length === 0) return null

  const N = projects.length
  const tilePitch = tileWidth + dials.cards.gap
  // Row-to-row vertical pitch (tile height + the gap-4 between rows), used as
  // the distance the credit card pops up/down out of the tile.
  const verticalPitch = tileHeight + dials.cards.gap
  // Pack items tightly when N supports it; otherwise stretch to keep
  // off-screen pad >= tileWidth so row-to-row teleports stay invisible.
  const baseSegLen = (N * tilePitch) / ROW_COUNT
  const minSegLen = rowWidth + 2 * tileWidth * dials.motion.padFactor
  const segLen = Math.max(baseSegLen, minSegLen)
  const totalLen = ROW_COUNT * segLen
  const itemSpacing = totalLen / N
  const offPad = (segLen - rowWidth) / 2

  return (
    <>
      <div
        ref={containerRef}
        className="flex h-full flex-col justify-center gap-4 py-4"
        onClick={(e) => {
          // Click on empty conveyor space (not on a tile) closes the detail.
          if (selectedId != null && e.target === e.currentTarget && onClose) onClose()
        }}
      >
        {[0, 1, 2].map((rowIdx) => (
          <div
            key={rowIdx}
            ref={rowIdx === 0 ? setRowEl : undefined}
            className="h-1/4 relative"
            // clip the conveyor horizontally, but let the credit card pop out
            // vertically (overflow-x:clip doesn't force overflow-y to auto)
            style={{ overflowX: 'clip', overflowY: 'visible' }}
            onClick={(e) => {
              if (selectedId != null && e.target === e.currentTarget && onClose) onClose()
            }}
          >
            {projects.map((project, i) => (
              <PathTile
                key={project.id}
                project={project}
                index={i}
                rowIdx={rowIdx}
                scroll={scroll}
                introProgress={introProgress}
                segLen={segLen}
                totalLen={totalLen}
                itemSpacing={itemSpacing}
                offPad={offPad}
                rowWidth={rowWidth}
                tilePitch={tilePitch}
                verticalPitch={verticalPitch}
                onSelect={onSelect}
                onClose={onClose}
                selected={project.id === selectedId}
                gridFaded={gridFaded}
                card={{
                  radius: dials.cards.radius,
                  borderWidth: dials.cards.borderWidth,
                  borderColor: dials.cards.borderColor,
                }}
                detailSpring={dials.motion.detailSpring as SpringOptions}
                creditSpring={dials.motion.creditSpring as SpringOptions}
                innerRef={rowIdx === 0 && i === 0 ? setTileEl : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  )
}


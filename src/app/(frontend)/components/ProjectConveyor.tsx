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
} from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
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

function Tile({
  project,
  onClick,
  faded,
}: {
  project: Project
  onClick: () => void
  faded: boolean
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
            className="overflow-hidden border outline-2 aspect-[16/9] h-full relative"
            animate={{
              borderColor: faded ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 1)',
              outlineColor: faded ? 'rgba(61, 61, 61, 0)' : 'rgba(61, 61, 61, 1)',
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
  introProgress,
  segLen,
  totalLen,
  itemSpacing,
  offPad,
  rowWidth,
  tilePitch,
  onSelect,
  onClose,
  selected,
  gridFaded,
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
  onSelect: (id: number) => void
  onClose?: () => void
  selected: boolean
  gridFaded: boolean
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
            onExitComplete={() => setPanelMounted(false)}
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
        <Tile project={project} onClick={handleTileClick} faded={tileFaded} />
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
  onExitComplete,
}: {
  project: Project
  tileX: MotionValue<number>
  rowWidth: number
  tilePitch: number
  onExitComplete?: () => void
}) {
  const [isPresent, safeToRemove] = usePresence()
  const [dir] = useState<1 | -1>(() => (tileX.get() + tilePitch / 2 < rowWidth / 2 ? 1 : -1))
  const offset = useMotionValue(0)
  const x = useTransform([tileX, offset], ([t, o]: number[]) => t + o)

  useEffect(() => {
    if (isPresent) {
      const ctrl = animate(offset, dir * tilePitch, SLIDE_SPRING)
      return () => ctrl.stop()
    }
    const ctrl = animate(offset, 0, SLIDE_SPRING)
    ctrl.then(() => {
      onExitComplete?.()
      safeToRemove?.()
    })
    return () => ctrl.stop()
  }, [isPresent, dir, tilePitch, offset, safeToRemove, onExitComplete])

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
      <DetailPanel project={project} />
    </motion.div>
  )
}

function directorName(project: Project): string {
  const credits = project.credits ?? []
  return credits.find((c) => c.role.toLowerCase() === 'director')?.name ?? credits[0]?.name ?? '—'
}

function DetailPanel({ project }: { project: Project }) {
  return (
    <div className="text-left h-full pointer-events-auto">
      <div className="p-2 flex flex-col gap-2 h-full">
        <div className="overflow-hidden border border-white outline-2 outline-[#3D3D3D] aspect-[16/9] h-full bg-[#C6B79C] p-3 flex flex-col gap-2">
          <div className="text-sm font-bold leading-tight">{project.title}</div>
          <div className="text-xs opacity-80">{directorName(project)}</div>
          {project.description && (
            <div className="text-xs flex-1 overflow-y-auto pr-1">
              <RichText data={project.description} />
            </div>
          )}
        </div>
      </div>
    </div>
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

  const [wheelStep, setWheelStep] = useState(DEFAULT_WHEEL_STEP)
  const [stiffness, setStiffness] = useState(DEFAULT_SPRING.stiffness)
  const [damping, setDamping] = useState(DEFAULT_SPRING.damping)
  const [mass, setMass] = useState(DEFAULT_SPRING.mass)
  const [padFactor, setPadFactor] = useState(DEFAULT_PAD_FACTOR)

  const scrollTarget = useMotionValue(0)
  const scroll = useSpring(scrollTarget, { stiffness, damping, mass })
  const introProgress = useMotionValue(0)
  const introStartedRef = useRef(false)

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
      // Selection freezes the conveyor — wheel events are swallowed so the
      // detail panel stays anchored to its tile.
      if (selectedId != null) return
      scrollTarget.set(scrollTarget.get() + (e.deltaY + e.deltaX) * wheelStep)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollTarget, wheelStep, selectedId])

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
  const tilePitch = tileWidth + TILE_GAP
  // Pack items tightly when N supports it; otherwise stretch to keep
  // off-screen pad >= tileWidth so row-to-row teleports stay invisible.
  const baseSegLen = (N * tilePitch) / ROW_COUNT
  const minSegLen = rowWidth + 2 * tileWidth * padFactor
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
            className="overflow-hidden h-1/4 relative"
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
                onSelect={onSelect}
                onClose={onClose}
                selected={project.id === selectedId}
                gridFaded={gridFaded}
                innerRef={rowIdx === 0 && i === 0 ? setTileEl : undefined}
              />
            ))}
          </div>
        ))}
      </div>
      <ConveyorDevPanel
        wheelStep={wheelStep}
        setWheelStep={setWheelStep}
        stiffness={stiffness}
        setStiffness={setStiffness}
        damping={damping}
        setDamping={setDamping}
        mass={mass}
        setMass={setMass}
        padFactor={padFactor}
        setPadFactor={setPadFactor}
      />
    </>
  )
}

function ConveyorDevPanel({
  wheelStep,
  setWheelStep,
  stiffness,
  setStiffness,
  damping,
  setDamping,
  mass,
  setMass,
  padFactor,
  setPadFactor,
}: {
  wheelStep: number
  setWheelStep: (v: number) => void
  stiffness: number
  setStiffness: (v: number) => void
  damping: number
  setDamping: (v: number) => void
  mass: number
  setMass: (v: number) => void
  padFactor: number
  setPadFactor: (v: number) => void
}) {
  const [open, setOpen] = useState(true)
  const reset = () => {
    setWheelStep(DEFAULT_WHEEL_STEP)
    setStiffness(DEFAULT_SPRING.stiffness)
    setDamping(DEFAULT_SPRING.damping)
    setMass(DEFAULT_SPRING.mass)
    setPadFactor(DEFAULT_PAD_FACTOR)
  }
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] bg-white/95 outline-1 outline-[#3D3D3D] drop-shadow-md p-3 text-xs font-mono select-none"
      style={{ width: 240 }}
    >
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="cursor-pointer text-left flex-1"
        >
          conveyor {open ? '▾' : '▸'}
        </button>
        {open && (
          <button type="button" onClick={reset} className="cursor-pointer underline">
            reset
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-2">
          <DevSlider
            label="wheel step"
            value={wheelStep}
            onChange={setWheelStep}
            min={0.05}
            max={10}
            step={0.05}
          />
          <DevSlider
            label="stiffness"
            value={stiffness}
            onChange={setStiffness}
            min={1}
            max={400}
            step={1}
          />
          <DevSlider
            label="damping"
            value={damping}
            onChange={setDamping}
            min={1}
            max={100}
            step={1}
          />
          <DevSlider label="mass" value={mass} onChange={setMass} min={0.1} max={5} step={0.1} />
          <DevSlider
            label="pad ×tile"
            value={padFactor}
            onChange={setPadFactor}
            min={0}
            max={3}
            step={0.05}
          />
        </div>
      )}
    </div>
  )
}

function DevSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <label className="block">
      <div className="flex justify-between">
        <span>{label}</span>
        <span>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  )
}

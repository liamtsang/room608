'use client'

import { useRef, useImperativeHandle, forwardRef, useCallback, useState, useEffect } from 'react'
import { motion, useMotionValue, useMotionValueEvent, animate, type PanInfo } from 'motion/react'
import { type TickMark } from './useTimeline'

export interface TimelineTrackHandle {
  scrollToX: (targetX: number) => void
}

interface TimelineTrackProps {
  canvasWidth: number
  ticks: TickMark[]
  selectedId: number | null
  onNearestProject: (id: number) => void
}

const TICK_OPACITY = 0.4

let audioCtx: AudioContext | null = null
function playTick(isProject: boolean) {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
    return
  }
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const osc2 = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'triangle'
  osc2.type = 'sine'
  osc.connect(gain)
  osc2.connect(gain)
  gain.connect(audioCtx.destination)
  osc.frequency.value = isProject ? 600 : 440
  osc2.frequency.value = isProject ? 600 : 440
  osc.detune.setValueAtTime(20, now)
  osc2.detune.setValueAtTime(0, now)
  const vol = isProject ? 0.06 : 0.03
  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(vol, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
  osc.start(now)
  osc.stop(now + 0.05)
}

export const TimelineTrack = forwardRef<TimelineTrackHandle, TimelineTrackProps>(
  function TimelineTrack({ canvasWidth, ticks, selectedId, onNearestProject }, ref) {
    const x = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const tickRefs = useRef<(HTMLDivElement | null)[]>([])
    const lastCenterIdx = useRef(-1)
    const [wrapperWidth, setWrapperWidth] = useState(0)

    useEffect(() => {
      const wrapper = containerRef.current?.parentElement
      if (!wrapper) return
      const measure = () => setWrapperWidth(wrapper.clientWidth)
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(wrapper)
      return () => ro.disconnect()
    }, [])

    // At x=0, offset the track so its center aligns with the wrapper center
    const offset = (wrapperWidth - canvasWidth) / 2

    // Snap points: the x value that centers each project marker in the wrapper.
    // At x=0 with the offset, canvasCenter aligns with wrapperCenter.
    const canvasCenter = canvasWidth / 2
    const snapPoints = ticks
      .filter((t) => t.isProject && t.project)
      .map((t) => ({
        id: t.project!.id,
        tickX: t.x,
        snapX: canvasCenter - t.x,
      }))

    // Derive drag bounds from the outermost snap points
    const minSnap = snapPoints.length ? Math.min(...snapPoints.map((s) => s.snapX)) : 0
    const maxSnap = snapPoints.length ? Math.max(...snapPoints.map((s) => s.snapX)) : 0

    const getNearestSnapPoint = useCallback(
      (currentX: number) => {
        let closest = snapPoints[0]
        let closestDist = Infinity

        for (const pt of snapPoints) {
          const dist = Math.abs(pt.snapX - currentX)
          if (dist < closestDist) {
            closestDist = dist
            closest = pt
          }
        }

        return closest
      },
      [snapPoints],
    )

    const updateGlow = useCallback(() => {
      const centerInCanvas = canvasCenter - x.get()

      let closestIdx = 0
      let closestDist = Infinity

      for (let i = 0; i < ticks.length; i++) {
        const dist = Math.abs(ticks[i].x - centerInCanvas)
        if (dist < closestDist) {
          closestDist = dist
          closestIdx = i
        }
      }

      // Play sound when center tick changes
      if (closestIdx !== lastCenterIdx.current) {
        if (lastCenterIdx.current !== -1) {
          playTick(ticks[closestIdx].isProject)
        }
        lastCenterIdx.current = closestIdx
      }

      for (let i = 0; i < ticks.length; i++) {
        const el = tickRefs.current[i]
        if (!el) continue
        el.style.opacity = String(i === closestIdx ? '1' : TICK_OPACITY)
      }
    }, [ticks, canvasCenter, x])

    useMotionValueEvent(x, 'change', updateGlow)

    useEffect(() => {
      updateGlow()
    }, [updateGlow])

    const snapTo = useCallback(
      (targetX: number) => {
        const dest = canvasCenter - targetX
        animate(x, dest, { type: 'spring', stiffness: 300, damping: 30 })
      },
      [canvasCenter, x],
    )

    const handleDrag = useCallback(() => {
      const nearest = getNearestSnapPoint(x.get())
      if (nearest) onNearestProject(nearest.id)
    }, [x, getNearestSnapPoint, onNearestProject])

    const handleDragEnd = useCallback(
      (_: unknown, info: PanInfo) => {
        // Factor in velocity so the snap feels natural with momentum
        const projected = x.get() + info.velocity.x * 0.2
        const nearest = getNearestSnapPoint(projected)
        if (nearest) {
          onNearestProject(nearest.id)
          animate(x, nearest.snapX, {
            type: 'spring',
            velocity: info.velocity.x,
            stiffness: 300,
            damping: 30,
          })
        }
      },
      [x, getNearestSnapPoint, onNearestProject],
    )

    const handleWheel = useCallback(
      (e: React.WheelEvent) => {
        e.preventDefault()
        const currentX = x.get()
        const current = getNearestSnapPoint(currentX)
        if (!current) return

        const currentIdx = snapPoints.indexOf(current)
        // Scroll down / right → next project (lower snapX), scroll up / left → previous
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX
        const nextIdx =
          delta > 0 ? Math.min(currentIdx + 1, snapPoints.length - 1) : Math.max(currentIdx - 1, 0)

        const target = snapPoints[nextIdx]
        onNearestProject(target.id)
        animate(x, target.snapX, { type: 'spring', stiffness: 300, damping: 30 })
      },
      [x, snapPoints, getNearestSnapPoint, onNearestProject],
    )

    useImperativeHandle(ref, () => ({ scrollToX: snapTo }))

    return (
      <motion.div
        ref={containerRef}
        className="timeline-track"
        style={{ width: canvasWidth, x, marginLeft: offset, cursor: 'grab' }}
        drag="x"
        dragConstraints={{ left: minSnap, right: maxSnap }}
        dragElastic={0.2}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onWheel={handleWheel}
      >
        {ticks.map((tick, i) => (
          <div
            key={i}
            ref={(el) => {
              tickRefs.current[i] = el
            }}
            className={tick.isProject ? 'timeline-marker' : 'timeline-tick'}
            style={{ left: tick.x }}
            data-selected={tick.isProject && tick.project?.id === selectedId ? '' : undefined}
          >
            {tick.isProject && tick.project && (
              <span className="timeline-marker-label">
                <span className="timeline-marker-title">{tick.project.title}</span>
                <span className="timeline-marker-year">
                  {new Date(tick.project.date).getFullYear()}
                </span>
              </span>
            )}
          </div>
        ))}
      </motion.div>
    )
  },
)

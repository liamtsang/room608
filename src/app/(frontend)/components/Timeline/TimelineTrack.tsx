'use client'

import { useRef, useImperativeHandle, forwardRef, useCallback, useState, useEffect } from 'react'
import { motion, useMotionValue, useMotionValueEvent, animate } from 'motion/react'
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

const DIM = 0.15
const LIT = 0.7

export const TimelineTrack = forwardRef<TimelineTrackHandle, TimelineTrackProps>(
  function TimelineTrack({ canvasWidth, ticks, selectedId, onNearestProject }, ref) {
    const x = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const tickRefs = useRef<(HTMLDivElement | null)[]>([])
    const dragStartX = useRef(0)
    const dragStartVal = useRef(0)
    const isDragging = useRef(false)
    const [viewportWidth, setViewportWidth] = useState(
      typeof window !== 'undefined' ? window.innerWidth : 1024,
    )

    useEffect(() => {
      const update = () => setViewportWidth(window.innerWidth)
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }, [])

    const canvasCenter = canvasWidth / 2
    const maxDrag = Math.max(0, (canvasWidth - viewportWidth) / 2)

    const getNearestProject = useCallback(() => {
      const centerInCanvas = canvasCenter - x.get()
      let closest: { id: number; x: number; dist: number } | null = null

      for (const tick of ticks) {
        if (!tick.isProject || !tick.project) continue
        const dist = Math.abs(tick.x - centerInCanvas)
        if (!closest || dist < closest.dist) {
          closest = { id: tick.project.id, x: tick.x, dist }
        }
      }

      return closest
    }, [ticks, x, canvasCenter])

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

      for (let i = 0; i < ticks.length; i++) {
        const el = tickRefs.current[i]
        if (!el) continue
        el.style.opacity = String(i === closestIdx ? LIT : DIM)
      }
    }, [ticks, canvasCenter, x])

    useMotionValueEvent(x, 'change', () => {
      updateGlow()
      if (!isDragging.current) return
      const nearest = getNearestProject()
      if (nearest) onNearestProject(nearest.id)
    })

    useEffect(() => {
      updateGlow()
    }, [updateGlow])

    const snapTo = useCallback(
      (targetX: number) => {
        const dest = canvasCenter - targetX
        const clamped = Math.max(-maxDrag, Math.min(maxDrag, dest))
        animate(x, clamped, { type: 'spring', stiffness: 300, damping: 30 })
      },
      [canvasCenter, maxDrag, x],
    )

    // Pointer-based drag — full control, no motion.dev drag reset
    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        isDragging.current = true
        dragStartX.current = e.clientX
        dragStartVal.current = x.get()
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      },
      [x],
    )

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDragging.current) return
        const delta = e.clientX - dragStartX.current
        const next = dragStartVal.current + delta
        const clamped = Math.max(-maxDrag, Math.min(maxDrag, next))
        x.set(clamped)
      },
      [x, maxDrag],
    )

    const handlePointerUp = useCallback(() => {
      if (!isDragging.current) return
      isDragging.current = false
      const nearest = getNearestProject()
      if (nearest) {
        onNearestProject(nearest.id)
        snapTo(nearest.x)
      }
    }, [getNearestProject, onNearestProject, snapTo])

    useImperativeHandle(ref, () => ({ scrollToX: snapTo }))

    return (
      <motion.div
        ref={containerRef}
        className="timeline-track"
        style={{ width: canvasWidth, x, cursor: 'grab' }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ right: canvasWidth / 2, left: (canvasWidth / 2) * -1 }}
        dragMomentum={false}
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

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

const DIM = 0.15
const LIT = 0.7

export const TimelineTrack = forwardRef<TimelineTrackHandle, TimelineTrackProps>(
  function TimelineTrack({ canvasWidth, ticks, selectedId, onNearestProject }, ref) {
    const x = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const tickRefs = useRef<(HTMLDivElement | null)[]>([])

    const canvasCenter = canvasWidth / 2

    // Snap points: the x value that centers each project marker on screen.
    // At x=0 the track is CSS-centered (margin: 0 auto), so canvasCenter
    // aligns with the viewport center. To center a tick at tickX we need
    // x = canvasCenter - tickX.
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

      for (let i = 0; i < ticks.length; i++) {
        const el = tickRefs.current[i]
        if (!el) continue
        el.style.opacity = String(i === closestIdx ? LIT : DIM)
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

    useImperativeHandle(ref, () => ({ scrollToX: snapTo }))

    return (
      <motion.div
        ref={containerRef}
        className="timeline-track"
        style={{ width: canvasWidth, x, cursor: 'grab' }}
        drag="x"
        dragConstraints={{ left: minSnap, right: maxSnap }}
        dragElastic={0.2}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
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

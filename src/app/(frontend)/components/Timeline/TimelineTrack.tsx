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

export const TimelineTrack = forwardRef<TimelineTrackHandle, TimelineTrackProps>(
  function TimelineTrack({ canvasWidth, ticks, selectedId, onNearestProject }, ref) {
    const x = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)
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

    /** Given current x, find the nearest project tick and return its canvas-local x */
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

    // Update selection while dragging
    useMotionValueEvent(x, 'change', () => {
      if (!isDragging.current) return
      const nearest = getNearestProject()
      if (nearest) onNearestProject(nearest.id)
    })

    /** Animate x so that a given canvas position lands at viewport center */
    const snapTo = useCallback(
      (targetX: number) => {
        const dest = canvasCenter - targetX
        const clamped = Math.max(-maxDrag, Math.min(maxDrag, dest))
        animate(x, clamped, { type: 'spring', stiffness: 300, damping: 30 })
      },
      [canvasCenter, maxDrag, x],
    )

    const handleDragEnd = useCallback(() => {
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
        style={{ width: canvasWidth, x }}
        drag="x"
        dragConstraints={{ left: -maxDrag, right: maxDrag }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={() => {
          isDragging.current = true
        }}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: 'grabbing' }}
      >
        {ticks.map((tick, i) => (
          <div
            key={i}
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

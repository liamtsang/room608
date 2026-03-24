'use client'

import { useRef, useEffect, useCallback } from 'react'
import type { Project } from '@/payload-types'
import { useTimeline } from './useTimeline'
import { useImagePrefetch } from './useImagePrefetch'
import { TimelineTrack, type TimelineTrackHandle } from './TimelineTrack'

interface TimelineProps {
  projects: Project[]
  selectedId: number | null
  onSelectProject: (id: number) => void
  mobile?: boolean
}

export function Timeline({ projects, selectedId, onSelectProject, mobile }: TimelineProps) {
  const { canvasWidth, ticks, projectPositions } = useTimeline(projects)
  const trackRef = useRef<TimelineTrackHandle>(null)
  const hasScrolledRef = useRef(false)

  useImagePrefetch(projects)

  // Scroll to the initially selected project on mount
  useEffect(() => {
    if (!hasScrolledRef.current && selectedId != null) {
      const x = projectPositions.get(selectedId)
      if (x != null) {
        trackRef.current?.scrollToX(x)
        hasScrolledRef.current = true
      }
    }
  }, [selectedId, projectPositions])

  const handleNearestProject = useCallback(
    (id: number) => {
      if (id !== selectedId) {
        onSelectProject(id)
      }
    },
    [selectedId, onSelectProject],
  )

  return (
    <div className={`timeline ${mobile ? 'timeline-mobile' : ''}`} aria-label="Project timeline">
      <div id="timeline-track-blur" />
      <div id="timeline-track-wrapper">
        <TimelineTrack
          ref={trackRef}
          canvasWidth={canvasWidth}
          ticks={ticks}
          selectedId={selectedId}
          onNearestProject={handleNearestProject}
        />{' '}
      </div>

      {!mobile && (
        <div className="absolute left-[50%] -translate-x-1/2 bottom-[-12px] text-white text-[6px]">
          ▲
        </div>
      )}
    </div>
  )
}

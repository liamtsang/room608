import { useMemo } from 'react'
import type { Project } from '@/payload-types'

export const TIMELINE = {
  /** Pixels between each minor tick */
  TICK_SPACING: 12,
  /** Number of minor ticks between each project marker */
  TICKS_BETWEEN_PROJECTS: 8,
  /** Height of a project (major) tick */
  MAJOR_TICK_H: 28,
  /** Height of a minor tick */
  MINOR_TICK_H: 12,
  /** Tick line width */
  TICK_WIDTH: 1,
  /** Extra minor ticks before first and after last project */
  EDGE_TICKS: 6,
} as const

export interface TickMark {
  /** Pixel offset from start of canvas */
  x: number
  /** True if this is a project tick */
  isProject: boolean
  /** Project data if isProject */
  project?: Project
  /** Index into the projects array (for project ticks only) */
  projectIndex?: number
}

/**
 * Builds a uniformly-spaced ruler of ticks.
 * Projects are sorted by date and placed at regular intervals.
 * Minor ticks fill the gaps between them.
 */
export function useTimeline(projects: Project[]) {
  const sorted = useMemo(
    () => [...projects].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [projects],
  )

  const { ticks, canvasWidth, projectPositions } = useMemo(() => {
    const marks: TickMark[] = []
    const positions = new Map<number, number>()

    if (sorted.length === 0) {
      return { ticks: marks, canvasWidth: 0, projectPositions: positions }
    }

    const { TICK_SPACING, TICKS_BETWEEN_PROJECTS, EDGE_TICKS } = TIMELINE
    let x = 0

    // Leading edge ticks
    for (let i = 0; i < EDGE_TICKS; i++) {
      marks.push({ x, isProject: false })
      x += TICK_SPACING
    }

    // For each project, place a major tick, then minor ticks after it
    sorted.forEach((project, i) => {
      marks.push({ x, isProject: true, project, projectIndex: i })
      positions.set(project.id, x)

      // Minor ticks after this project (except after the last one — those are edge ticks)
      const fillCount = i < sorted.length - 1 ? TICKS_BETWEEN_PROJECTS : EDGE_TICKS
      for (let t = 0; t < fillCount; t++) {
        x += TICK_SPACING
        marks.push({ x, isProject: false })
      }
    })

    return { ticks: marks, canvasWidth: x, projectPositions: positions }
  }, [sorted])

  return { sorted, ticks, canvasWidth, projectPositions }
}

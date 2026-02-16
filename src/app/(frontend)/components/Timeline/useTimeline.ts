import { useMemo } from 'react'
import type { Project } from '@/payload-types'

export const TIMELINE = {
  /** Pixels per month on the timeline */
  PX_PER_MONTH: 8,
  /** Height of a project (major) tick */
  MAJOR_TICK_H: 28,
  /** Height of a minor tick */
  MINOR_TICK_H: 12,
  /** Tick line width */
  TICK_WIDTH: 1,
  /** Extra months of padding before first and after last project */
  EDGE_MONTHS: 6,
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

/** Returns the number of months between two dates (fractional) */
function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

/**
 * Builds a timeline ruler where spacing is proportional to real time.
 * One tick per month, with project markers placed at their actual dates.
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

    const { PX_PER_MONTH, EDGE_MONTHS } = TIMELINE

    const firstDate = new Date(sorted[0].date)
    const lastDate = new Date(sorted[sorted.length - 1].date)

    // Timeline starts EDGE_MONTHS before the first project
    const startDate = new Date(firstDate.getFullYear(), firstDate.getMonth() - EDGE_MONTHS, 1)
    // Timeline ends EDGE_MONTHS after the last project
    const endDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + EDGE_MONTHS, 1)

    const totalMonths = monthsBetween(startDate, endDate)

    // First pass: place all project markers and record their x positions
    const projectXPositions: number[] = []
    for (let m = 0; m <= totalMonths; m++) {
      const tickDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1)
      const x = m * PX_PER_MONTH

      for (let pi = 0; pi < sorted.length; pi++) {
        const project = sorted[pi]
        const projDate = new Date(project.date)
        if (
          projDate.getFullYear() === tickDate.getFullYear() &&
          projDate.getMonth() === tickDate.getMonth() &&
          !positions.has(project.id)
        ) {
          const projectX = Math.round(x / PX_PER_MONTH) * PX_PER_MONTH
          marks.push({ x: projectX, isProject: true, project, projectIndex: pi })
          positions.set(project.id, projectX)
          projectXPositions.push(projectX)
        }
      }
    }

    // Second pass: place month ticks, skipping any that are too close to a project marker
    for (let m = 0; m <= totalMonths; m++) {
      const x = m * PX_PER_MONTH
      const tooClose = projectXPositions.some((px) => Math.abs(px - x) < PX_PER_MONTH * 0.8)
      if (!tooClose) {
        marks.push({ x, isProject: false })
      }
    }

    // Sort all marks by x position
    marks.sort((a, b) => a.x - b.x)

    const width = totalMonths * PX_PER_MONTH
    return { ticks: marks, canvasWidth: width, projectPositions: positions }
  }, [sorted])

  return { sorted, ticks, canvasWidth, projectPositions }
}

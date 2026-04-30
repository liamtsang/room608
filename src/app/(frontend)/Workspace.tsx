'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'
import { Timeline } from './components/Timeline/Timeline'
import { ProjectConveyor } from './components/ProjectConveyor'
import { ProjectDetail } from './components/ProjectDetail'
import { usePageTransition } from './components/TransitionContext'
import { useRoom } from './components/RoomContext'
import { MobileNav } from './components/MobileNav'

export function Workspace({ projects }: { projects: Project[] }) {
  const { transitioning } = usePageTransition()
  const { roomEntered } = useRoom()
  // Desktop starts on the grid (selectedId = null). Mobile auto-selects first project below.
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [direction, setDirection] = useState(0) // -1 = left, 1 = right
  const prevSelectedId = useRef(selectedId)

  const projectIndex = useMemo(() => {
    const map = new Map<number, number>()
    projects.forEach((p, i) => map.set(p.id, i))
    return map
  }, [projects])

  const handleSelectProject = useCallback(
    (id: number) => {
      const prevIdx =
        prevSelectedId.current != null ? (projectIndex.get(prevSelectedId.current) ?? 0) : 0
      const nextIdx = projectIndex.get(id) ?? 0
      setDirection(nextIdx > prevIdx ? 1 : -1)
      prevSelectedId.current = id
      setSelectedId(id)
    },
    [projectIndex],
  )

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Mobile keeps the timeline + auto-selected first project; desktop starts on the grid.
  useEffect(() => {
    if (isMobile && selectedId == null && projects[0]) {
      setSelectedId(projects[0].id)
      prevSelectedId.current = projects[0].id
    }
  }, [isMobile, selectedId, projects])

  const handleCloseDetail = useCallback(() => {
    setSelectedId(null)
  }, [])

  // Escape key closes detail view on desktop
  useEffect(() => {
    if (isMobile || selectedId == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseDetail()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile, selectedId, handleCloseDetail])

  const selected = projects.find((p) => p.id === selectedId) ?? null

  const images = useMemo(
    () => (selected?.images ?? []).filter((img): img is Media => typeof img !== 'number'),
    [selected],
  )

  const credits = selected?.credits ?? []

  const emmyAwards = useMemo(
    () =>
      (selected?.awards ?? []).filter(
        (a) =>
          a.type === 'news-documentary-emmy' ||
          a.type === 'primetime-emmy' ||
          a.type === 'emmy-nomination' ||
          a.type === 'daytime-emmy' ||
          a.type === 'new-york-emmy',
      ),
    [selected],
  )

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col">
        {/* Timeline at top */}
        <AnimatePresence>
          {!transitioning && roomEntered && (
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 10000 }}
            >
              <Timeline
                projects={projects}
                selectedId={selectedId}
                onSelectProject={handleSelectProject}
                mobile
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction}>
            {selected ? (
              <motion.div
                key={selected.id}
                custom={direction}
                className="flex flex-col p-3 gap-3 h-full overflow-y-auto"
                variants={{
                  enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
                  center: {
                    x: '0%',
                    opacity: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 35,
                      staggerChildren: 0.1,
                    },
                  },
                  exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              >
                {credits.length > 0 && (
                  <motion.div
                    className="bg-[#C6B79C] outline-1 outline-color-[#3D3D3D] drop-shadow-md p-3 grid gap-2 grid-cols-[auto, 1fr]"
                    variants={{
                      enter: { opacity: 0, y: 0 },
                      center: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className="grid grid-cols-subgrid col-span-2 w-fit gap-2">
                      <div className="outline-1 outline-color-[#3D3D3D] p-2">Title</div>
                      <div className="outline-1 outline-color-[#3D3D3D] p-2">{selected.title}</div>
                    </div>
                    {credits.map((c, i) => (
                      <div className="grid grid-cols-subgrid col-span-2 w-fit gap-2" key={i}>
                        <div className="outline-1 outline-color-[#3D3D3D] p-2">{c.role}</div>
                        <div className="outline-1 outline-color-[#3D3D3D] p-2">{c.name}</div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {selected.description && (
                  <motion.div
                    className="bg-[#C6B79C] outline-1 outline-color-[#515151] drop-shadow-md"
                    variants={{
                      enter: { opacity: 0, y: 0 },
                      center: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <RichText data={selected.description} />
                  </motion.div>
                )}

                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    className="border-b border-white"
                    variants={{
                      enter: { opacity: 0, y: 0 },
                      center: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {img.url && (
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full object-contain border border-white outline-2 outline-[#3D3D3D]"
                      />
                    )}
                  </motion.div>
                ))}

                {emmyAwards.length > 0 && (
                  <motion.div
                    className="flex flex-col items-center py-4"
                    variants={{
                      enter: { opacity: 0, y: 0 },
                      center: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className="group relative flex flex-col items-center">
                      <img
                        src="/awards/emmy.png"
                        alt="Emmy Award"
                        draggable={false}
                        className="h-32 w-auto select-none drop-shadow-lg"
                      />
                      <div className="mt-2 bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md p-3">
                        {emmyAwards.map((a, i) => (
                          <div key={i} className="text-sm">
                            {a.details || a.type}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mobile nav */}
                <motion.div
                  variants={{
                    enter: { opacity: 0, y: 0 },
                    center: { opacity: 1, y: 0 },
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <MobileNav />
                </motion.div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center opacity-40">
                <p>No projects to display.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <div className="relative h-full overflow-hidden">
        {/* Grid view */}
        <AnimatePresence>
          {!transitioning && roomEntered && selectedId == null && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 30 }}
              className="absolute inset-0"
            >
              <ProjectConveyor projects={projects} onSelect={handleSelectProject} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail view */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={`detail-wrapper-${selected.id}`}
              className="absolute inset-0 bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseDetail()
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Close"
                className="absolute top-4 right-4 z-50 bg-[#C6B79C] outline-1 outline-[#3D3D3D] drop-shadow-md w-10 h-10 flex items-center justify-center text-lg cursor-pointer hover:scale-105 transition-transform"
              >
                ×
              </button>

              <ProjectDetail project={selected} />
            </motion.div>
          )}
        </AnimatePresence>

        {projects.length === 0 && (
          <div className="flex h-full items-center justify-center opacity-40">
            <p>No projects to display.</p>
          </div>
        )}
      </div>
    </div>
  )
}

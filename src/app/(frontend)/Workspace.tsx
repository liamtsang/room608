'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'
import { ProjectConveyor } from './components/ProjectConveyor'
import { usePageTransition } from './components/TransitionContext'
import { MobileGrid } from './components/MobileGrid'
import { MobileHamburger } from './components/MobileHamburger'

export function Workspace({ projects }: { projects: Project[] }) {
  const { transitioning } = usePageTransition()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleSelectProject = useCallback((id: number) => {
    setSelectedId(id)
  }, [])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
      <div className="relative h-screen overflow-hidden">
        <MobileHamburger />
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={`detail-${selected.id}`}
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="absolute inset-0 flex flex-col"
            >
              <button
                type="button"
                onClick={handleCloseDetail}
                className="fixed top-4 left-4 z-30 bg-[#282828] border-2 border-[#C6B79C] outline outline-black px-2 py-1 text-white font-bold"
                aria-label="Back to grid"
              >
                ← back
              </button>
              <div className="flex-1 overflow-y-auto p-3 pt-16 flex flex-col gap-3">
                {credits.length > 0 && (
                  <div className="bg-[#C6B79C] outline-1 outline-color-[#3D3D3D] drop-shadow-md p-3 grid gap-2 grid-cols-[auto, 1fr]">
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
                  </div>
                )}

                {selected.description && (
                  <div className="bg-[#C6B79C] outline-1 outline-color-[#515151] drop-shadow-md">
                    <RichText data={selected.description} />
                  </div>
                )}

                {images.map((img) => (
                  <div key={img.id} className="border-b border-white">
                    {img.url && (
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full object-contain border border-white outline-2 outline-[#3D3D3D]"
                      />
                    )}
                  </div>
                ))}

                {emmyAwards.length > 0 && (
                  <div className="flex flex-col items-center py-4">
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
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {!transitioning && (
                <MobileGrid projects={projects} onSelect={handleSelectProject} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <div className="relative h-full overflow-hidden">
        {/* Grid view — kept mounted across detail open/close so conveyor scroll state is preserved.
            Selection now slides a panel out from behind the clicked tile inside the conveyor. */}
        <AnimatePresence>
          {!transitioning && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 30 }}
              className="absolute inset-0"
            >
              <ProjectConveyor
                projects={projects}
                onSelect={handleSelectProject}
                onClose={handleCloseDetail}
                selectedId={selectedId}
              />
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

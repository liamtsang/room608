'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'
import { Timeline } from './components/Timeline/Timeline'
import { usePageTransition } from './components/TransitionContext'
import { useRoom } from './components/RoomContext'

interface Position {
  x: number
  y: number
  rotate: number
  tx: number
  ty: number
}

interface ItemSize {
  w: number
  h: number
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function estimateImageSize(media: Media): ItemSize {
  const maxW = 512,
    maxH = 320
  const w = media.width ?? maxW
  const h = media.height ?? maxH
  const scale = Math.min(maxW / w, maxH / h, 1)
  return { w: Math.round(w * scale) + 6, h: Math.round(h * scale) + 6 }
}

function extractTextFromLexical(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as Record<string, unknown>
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) return n.children.map(extractTextFromLexical).join('')
  if (n.root && typeof n.root === 'object') return extractTextFromLexical(n.root)
  return ''
}

function estimateCreditsSize(title: string, credits: NonNullable<Project['credits']>): ItemSize {
  const chWidth = 10.8
  const lineHeight = 32
  const longest = Math.max(title.length, ...credits.map((c) => `${c.role}: ${c.name}`.length))
  const w = longest * chWidth + 32
  const h = (1 + credits.length) * lineHeight + 16
  return { w: Math.round(w), h: Math.round(h) }
}

function estimateDescriptionSize(description: Project['description']): ItemSize {
  if (!description) return { w: 200, h: 64 }
  const text = extractTextFromLexical(description)
  const chWidth = 10.8
  const lineHeight = 32
  const maxChars = 55
  const lines = Math.max(1, Math.ceil(text.length / maxChars))
  const w = Math.min(text.length, maxChars) * chWidth + 16
  const h = lines * lineHeight + 16
  return { w: Math.round(w), h: Math.round(h) }
}

function forcePlacement(items: ItemSize[], seed: number): Position[] {
  if (items.length === 0) return []

  const rand = seededRandom(seed)
  const noise = 30

  const dirs = [
    { dx: -1, dy: -1 }, // top-left
    { dx: 1, dy: -1 }, // top-right
    { dx: -1, dy: 1 }, // bottom-left
    { dx: 1, dy: 1 }, // bottom-right
  ]

  return items.map((item, i) => {
    const qi = i % dirs.length
    const d = dirs[qi]
    // Translate by the item's full size + gap so adjacent quadrants don't overlap
    const gap = 16
    const tx = d.dx * (item.w * 0.5 + gap + rand() * noise)
    const ty = d.dy * (item.h * 0.5 + gap + rand() * noise)

    return { x: 50, y: 50, rotate: 0, tx, ty }
  })
}

function FloatingUnit({
  children,
  position,
  index,
  onFocus,
  zIndex,
}: {
  children: React.ReactNode
  position: Position
  index: number
  onFocus: () => void
  zIndex: number
}) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={{
        scale: 0.9,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0.98,
        opacity: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 25,
        bounce: 0.1,
        delay: index * 0.05,
      }}
      whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
      onPointerDown={onFocus}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        translate: `calc(-50% + ${position.tx}px) calc(-50% + ${position.ty}px)`,
        zIndex,
        cursor: 'grab',
      }}
    >
      {children}
    </motion.div>
  )
}

export function Workspace({ projects }: { projects: Project[] }) {
  const { transitioning } = usePageTransition()
  const { roomEntered } = useRoom()
  const [selectedId, setSelectedId] = useState<number | null>(projects[0]?.id ?? null)
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

  const zCounter = useRef(1)
  const [zIndices, setZIndices] = useState<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setViewport({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const selected = projects.find((p) => p.id === selectedId) ?? null

  const images = useMemo(
    () => (selected?.images ?? []).filter((img): img is Media => typeof img !== 'number'),
    [selected],
  )

  const credits = selected?.credits ?? []

  const positions = useMemo(() => {
    if (!viewport || !selected) return []
    const items: ItemSize[] = []
    if (credits.length > 0) items.push(estimateCreditsSize(selected.title, credits))
    if (selected.description) items.push(estimateDescriptionSize(selected.description))
    for (const img of images) items.push(estimateImageSize(img))
    return forcePlacement(items, selected.id)
  }, [selected?.id, images, viewport, selected?.description, credits])

  const bringToFront = useCallback((key: string) => {
    const next = ++zCounter.current
    setZIndices((prev) => ({ ...prev, [key]: next }))
  }, [])

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
    <div className="h-screen pb-16">
      {/* Workspace */}
      <div ref={containerRef} className="relative h-full overflow-hidden">
        <AnimatePresence mode="popLayout">
          {selected && positions.length > 0 ? (
            <div key={selected.id} className="contents">
              {/* Floating units */}
              {credits.length > 0 && (
                <FloatingUnit
                  key={`credits-${selected.id}`}
                  position={positions[0]}
                  index={0}
                  zIndex={zIndices[`credits-${selected.id}`] ?? 1}
                  onFocus={() => bringToFront(`credits-${selected.id}`)}
                >
                  <div className="bg-[#C6B79C] outline-1 outline-color-[#3D3D3D] drop-shadow-md p-3 grid grid-cols-[auto,1fr] gap-2">
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
                </FloatingUnit>
              )}

              {selected.description &&
                (() => {
                  const posIndex = credits.length > 0 ? 1 : 0
                  return (
                    <FloatingUnit
                      key={`desc-${selected.id}`}
                      position={positions[posIndex]}
                      index={posIndex}
                      zIndex={zIndices[`desc-${selected.id}`] ?? 1}
                      onFocus={() => bringToFront(`desc-${selected.id}`)}
                    >
                      <div className="bg-[#C6B79C] outline-1 outline-color-[#515151] drop-shadow-md">
                        <RichText data={selected.description} />
                      </div>
                    </FloatingUnit>
                  )
                })()}

              {images.map((img, i) => {
                const posIndex = (credits.length > 0 ? 1 : 0) + (selected.description ? 1 : 0) + i
                const key = `img-${img.id}`
                return (
                  <FloatingUnit
                    key={key}
                    position={positions[posIndex]}
                    index={posIndex}
                    zIndex={zIndices[key] ?? 1}
                    onFocus={() => bringToFront(key)}
                  >
                    <div className="overflow-hidden border border-white outline-2 outline-[#3D3D3D]">
                      {img.url && (
                        <img
                          src={img.url}
                          alt={img.alt}
                          draggable={false}
                          className="max-h-80 max-w-lg object-contain select-none"
                        />
                      )}
                    </div>
                  </FloatingUnit>
                )
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center opacity-40">
              <p>No projects to display.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Timeline */}
      <AnimatePresence>
        {!transitioning && roomEntered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 30, delay: 0.4 }}
          >
            <Timeline
              projects={projects}
              selectedId={selectedId}
              onSelectProject={handleSelectProject}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

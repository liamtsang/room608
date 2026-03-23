'use client'

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'
import { Timeline } from './components/Timeline/Timeline'

interface Position {
  x: number
  y: number
  rotate: number
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

function forcePlacement(items: ItemSize[], seed: number, vw: number, vh: number): Position[] {
  if (items.length === 0) return []

  const rand = seededRandom(seed)
  const padding = 24
  const iterations = 100
  const damping = 0.7

  const bodies = items.map((item) => ({
    x: rand() * (vw - item.w - padding * 2) + padding,
    y: rand() * (vh - item.h - padding * 2) + padding,
    w: item.w,
    h: item.h,
    vx: 0,
    vy: 0,
  }))

  for (let iter = 0; iter < iterations; iter++) {
    const forces = bodies.map(() => ({ fx: 0, fy: 0 }))

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i],
          b = bodies[j]
        const acx = a.x + a.w / 2,
          acy = a.y + a.h / 2
        const bcx = b.x + b.w / 2,
          bcy = b.y + b.h / 2
        const overlapX = (a.w + b.w) / 2 + padding - Math.abs(acx - bcx)
        const overlapY = (a.h + b.h) / 2 + padding - Math.abs(acy - bcy)

        if (overlapX > 0 && overlapY > 0) {
          const dx = acx - bcx || 0.1
          const dy = acy - bcy || 0.1

          if (overlapX < overlapY) {
            const push = Math.sign(dx) * overlapX * 0.5
            forces[i].fx += push
            forces[j].fx -= push
          } else {
            const push = Math.sign(dy) * overlapY * 0.5
            forces[i].fy += push
            forces[j].fy -= push
          }
        }
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i]
      const margin = padding
      if (b.x < margin) forces[i].fx += (margin - b.x) * 0.4
      if (b.y < margin) forces[i].fy += (margin - b.y) * 0.4
      if (b.x + b.w > vw - margin) forces[i].fx -= (b.x + b.w - vw + margin) * 0.4
      if (b.y + b.h > vh - margin) forces[i].fy -= (b.y + b.h - vh + margin) * 0.4
    }

    for (let i = 0; i < bodies.length; i++) {
      bodies[i].vx = (bodies[i].vx + forces[i].fx) * damping
      bodies[i].vy = (bodies[i].vy + forces[i].fy) * damping
      bodies[i].x += bodies[i].vx
      bodies[i].y += bodies[i].vy
    }
  }

  return bodies.map((b) => ({
    x: Math.max(0, Math.min((b.x / vw) * 100, ((vw - b.w) / vw) * 100)),
    y: Math.max(0, Math.min((b.y / vh) * 100, ((vh - b.h) / vh) * 100)),
    rotate: 0,
  }))
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
        left: `${position.x}%`,
        top: `${position.y}%`,
        rotate: 0,
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
      style={{ position: 'absolute', zIndex, cursor: 'grab' }}
    >
      {children}
    </motion.div>
  )
}

export function Workspace({ projects }: { projects: Project[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(projects[0]?.id ?? null)
  const zCounter = useRef(1)
  const [zIndices, setZIndices] = useState<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<{ w: number; h: number } | null>(null)

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

  const positions = useMemo(() => {
    if (!viewport || !selected) return []
    const items: ItemSize[] = []
    if (selected.description) items.push(estimateDescriptionSize(selected.description))
    for (const img of images) items.push(estimateImageSize(img))
    return forcePlacement(items, selected.id, viewport.w, viewport.h)
  }, [selected?.id, images, viewport, selected?.description])

  const bringToFront = useCallback((key: string) => {
    const next = ++zCounter.current
    setZIndices((prev) => ({ ...prev, [key]: next }))
  }, [])

  return (
    <div className="h-screen pb-16">
      {/* Workspace */}
      <div ref={containerRef} className="relative h-full overflow-hidden">
        <AnimatePresence mode="popLayout">
          {selected && positions.length > 0 ? (
            <div key={selected.id} className="contents">
              {/* Floating units */}
              {selected.description && (
                <FloatingUnit
                  key={`desc-${selected.id}`}
                  position={positions[0]}
                  index={0}
                  zIndex={zIndices[`desc-${selected.id}`] ?? 1}
                  onFocus={() => bringToFront(`desc-${selected.id}`)}
                >
                  <div className="bg-[#C6B79C] outline-1 outline-color-[#515151] drop-shadow-md">
                    <RichText data={selected.description} />
                  </div>
                </FloatingUnit>
              )}

              {images.map((img, i) => {
                const posIndex = selected.description ? i + 1 : i
                const key = `img-${img.id}`
                return (
                  <FloatingUnit
                    key={key}
                    position={positions[posIndex]}
                    index={posIndex}
                    zIndex={zIndices[key] ?? 1}
                    onFocus={() => bringToFront(key)}
                  >
                    <div className="overflow-hidden border border-white outline-2 outline-black">
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
      <Timeline projects={projects} selectedId={selectedId} onSelectProject={setSelectedId} />
    </div>
  )
}

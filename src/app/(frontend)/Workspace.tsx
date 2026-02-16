'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { motion } from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Media, Project } from '@/payload-types'
import { Timeline } from './components/Timeline/Timeline'

interface Position {
  x: number
  y: number
  rotate: number
}

function randomPositions(count: number): Position[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 60 + 5,
    y: Math.random() * 60 + 5,
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
        rotate: position.rotate,
        scale: 0.9,
        opacity: 0,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
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

  const selected = projects.find((p) => p.id === selectedId) ?? null

  const images = useMemo(
    () => (selected?.images ?? []).filter((img): img is Media => typeof img !== 'number'),
    [selected],
  )

  const unitCount = (selected?.description ? 1 : 0) + images.length
  const positions = useMemo(() => randomPositions(unitCount), [selected?.id, unitCount])

  const bringToFront = useCallback((key: string) => {
    const next = ++zCounter.current
    setZIndices((prev) => ({ ...prev, [key]: next }))
  }, [])

  return (
    <div className="h-screen pb-16">
      {/* Workspace */}
      <div className="relative h-full overflow-hidden">
        {selected ? (
          <>
            {/* Title bar */}
            <div className="absolute top-0 left-0 right-0 p-6 z-50 pointer-events-none">
              <h1 className="text-2xl font-bold">{selected.title}</h1>
              <p className="text-sm opacity-50">
                {new Date(selected.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

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
          </>
        ) : (
          <div className="flex h-full items-center justify-center opacity-40">
            <p>No projects to display.</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <Timeline projects={projects} selectedId={selectedId} onSelectProject={setSelectedId} />
    </div>
  )
}

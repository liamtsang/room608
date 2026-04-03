'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useSpring, useTransform, useMotionValueEvent } from 'motion/react'
import Image from 'next/image'
import { useRoom } from './RoomContext'

export function RoomScene({ children }: { children: React.ReactNode }) {
  const { setRoomEntered } = useRoom()
  const [hasEntered, setHasEntered] = useState(false)
  const [flattened, setFlattened] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setRoomEntered(false)
    return () => setRoomEntered(true)
  }, [setRoomEntered])

  const enter = useCallback(() => {
    if (hasEntered) return
    setHasEntered(true)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [hasEntered])

  useEffect(() => {
    timerRef.current = setTimeout(enter, 2000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enter])

  // Spring-driven rotation: 0 = looking at front wall, 90 = looking at floor
  const progress = useSpring(0, { stiffness: 50, damping: 20, mass: 1.5 })

  useEffect(() => {
    progress.set(hasEntered ? 1 : 0)
  }, [hasEntered, progress])

  // Cube rotates 90deg on X: front face tips back, bottom face comes up
  const cubeRotateX = useTransform(progress, [0, 1], ['0deg', '-90deg'])
  const floorTranslateZ = useTransform(progress, [0, 1], ['-50vh', '0vh'])
  const floorTransform = useTransform(floorTranslateZ, (z) => `rotateX(90deg) translateZ(${z})`)

  useMotionValueEvent(progress, 'change', (v) => {
    if (v > 0.995 && hasEntered && !flattened) {
      setFlattened(true)
      setRoomEntered(true)
    }
  })

  // if (flattened) {
  //   return <>{children}</>
  // }

  // Two-sided cube: front face (wall) and bottom face (floor).
  // We're "inside" the cube. Each face is pushed out by half the cube size
  // (50vh) so they form a proper 90° corner.
  //
  // At rotateX(0): front face faces us (wall with logo)
  // At rotateX(90): bottom face faces us (workspace/desk)

  return (
    <div
      style={{
        perspective: '100vh',
        perspectiveOrigin: 'center center',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <motion.div
        style={{
          rotateX: cubeRotateX,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Front face (wall) — pushed toward viewer by 50vh */}
        <div
          onClick={enter}
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'translateZ(-50vh)',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            background: '',
            cursor: 'pointer',
          }}
        >
          <Image
            src="/logo hd.png"
            alt="Room 608"
            width={200}
            height={200}
            className="border border-[#C6B79C]"
            priority
          />
          <motion.div
            animate={{ y: [0, 6, 0], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              color: '#C6B79C',
              fontSize: 13,
              fontFamily: 'iA Writer Mono, monospace',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 3v10M4 9l4 4 4-4" />
            </svg>
          </motion.div>
        </div>

        {/* Back face */}

        {/* Top face (ceiling) */}

        {/* Left face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(-90deg) translateZ(-50vh)',
            background: '',
          }}
        />

        {/* Right face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(90deg) translateZ(-50vh)',
            background: '',
          }}
        />

        {/* Bottom face (floor) — rotated 90deg on X, translateZ animates -50vh → 0 */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            transform: floorTransform,
            background: `linear-gradient(90deg, var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%)
      center / var(--dot-space) var(--dot-space),
    linear-gradient(var(--dot-bg) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center /
      var(--dot-space) var(--dot-space),
    var(--dot-color)`,
            backfaceVisibility: 'hidden',
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  )
}

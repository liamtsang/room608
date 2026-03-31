'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useContext, useRef, useState, useMemo } from 'react'
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { TransitionContext } from './TransitionContext'

const pageOrder: Record<string, number> = {
  '/': 0,
  '/about': 1,
  '/sitemap': 2,
}

function getPageIndex(pathname: string): number {
  if (pathname in pageOrder) return pageOrder[pathname]
  return 100
}

// Freezes the rendered content so the exiting page doesn't get
// replaced by Next.js before the exit animation finishes
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext)
  const frozen = useRef(context).current

  return <LayoutRouterContext.Provider value={frozen}>{children}</LayoutRouterContext.Provider>
}

const variants = {
  initial: (direction: number) => ({
    y: `${direction * 100}%`,
  }),
  animate: {
    y: '0%',
  },
  exit: (direction: number) => ({
    y: `${direction * -100}%`,
  }),
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)
  const directionRef = useRef(1)
  const [transitioning, setTransitioning] = useState(false)

  if (prevPathRef.current !== pathname) {
    const prevIndex = getPageIndex(prevPathRef.current)
    const currentIndex = getPageIndex(pathname)
    directionRef.current = currentIndex > prevIndex ? 1 : -1
    prevPathRef.current = pathname
    setTransitioning(true)
  }

  const direction = directionRef.current

  const ctx = useMemo(() => ({ transitioning }), [transitioning])

  return (
    <TransitionContext.Provider value={ctx}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={pathname}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 235, damping: 30, mass: 1 }}
          onAnimationComplete={() => setTransitioning(false)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </TransitionContext.Provider>
  )
}

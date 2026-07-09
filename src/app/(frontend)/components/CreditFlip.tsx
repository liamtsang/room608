'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { Project } from '@/payload-types'

type Credit = NonNullable<Project['credits']>[number]

// A row rendered in the credit card. Exactly one of `roles` / `names` holds
// multiple values (the flipping cell); the anchored side is a single string.
export type CreditRow =
  | { kind: 'static'; role: string; name: string }
  | { kind: 'person'; roles: string[]; name: string } // one person, many roles → role cell flips
  | { kind: 'role'; role: string; names: string[] } //   one role, many people → name cell flips

// Collapse redundant credits into rows. Person-first: a person credited in
// several roles collapses into one row whose role flips; from what's left, a
// role shared by several people collapses into one row whose name flips; the
// rest render static. A credit that shares BOTH a person and a role is claimed
// by the person pass, so its role may then look unique among the leftovers —
// an accepted trade-off that matches the "Writer: Mark → Director: Mark" case.
export function groupCredits(credits: Credit[]): CreditRow[] {
  const consumed = new Set<number>()
  const rows: { order: number; row: CreditRow }[] = []

  // Pass 1: group by person (name), keep first-seen order.
  const byName = new Map<string, number[]>()
  credits.forEach((c, i) => {
    const key = c.name.trim()
    if (!byName.has(key)) byName.set(key, [])
    byName.get(key)!.push(i)
  })
  for (const idxs of byName.values()) {
    const roles = dedupe(idxs.map((i) => credits[i].role))
    if (roles.length < 2) continue
    idxs.forEach((i) => consumed.add(i))
    rows.push({ order: idxs[0], row: { kind: 'person', roles, name: credits[idxs[0]].name } })
  }

  // Pass 2: from the leftovers, group by role.
  const byRole = new Map<string, number[]>()
  credits.forEach((c, i) => {
    if (consumed.has(i)) return
    const key = c.role.trim()
    if (!byRole.has(key)) byRole.set(key, [])
    byRole.get(key)!.push(i)
  })
  for (const idxs of byRole.values()) {
    const names = dedupe(idxs.map((i) => credits[i].name))
    if (names.length < 2) continue
    idxs.forEach((i) => consumed.add(i))
    rows.push({ order: idxs[0], row: { kind: 'role', role: credits[idxs[0]].role, names } })
  }

  // Pass 3: everything still unconsumed is a static row.
  credits.forEach((c, i) => {
    if (consumed.has(i)) return
    rows.push({ order: i, row: { kind: 'static', role: c.role, name: c.name } })
  })

  return rows.sort((a, b) => a.order - b.order).map((r) => r.row)
}

function dedupe(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()))]
}

const FLIP_MS = 2000

// A single boxed cell. One value → static. Multiple values → auto-advances on
// a timer, flipping the whole boxed cell on the X axis — the block rotates,
// not just the text inside a stationary box.
// Honors reduced-motion by rendering the values as a static comma list.
export function FlipCell({ values, className }: { values: string[]; className?: string }) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)

  useEffect(() => {
    if (reduced || values.length < 2) return
    const id = setInterval(() => setI((n) => (n + 1) % values.length), FLIP_MS)
    return () => clearInterval(id)
  }, [reduced, values.length])

  if (values.length === 1) return <div className={className}>{values[0]}</div>
  if (reduced) return <div className={className}>{values.join(', ')}</div>

  const value = values[i % values.length]
  return (
    <div style={{ perspective: 400 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={value}
          className={className}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          style={{ transformOrigin: 'center', backfaceVisibility: 'hidden', height: '100%' }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

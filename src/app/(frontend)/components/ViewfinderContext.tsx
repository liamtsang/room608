'use client'

import { createContext, useContext, useState } from 'react'
import type { Project } from '@/payload-types'

interface ViewfinderContextValue {
  // The project whose info the viewfinder should display, or null when idle.
  selected: Project | null
  setSelected: (p: Project | null) => void
  // Close handler registered by whoever owns the selection state (Workspace),
  // so the viewfinder's own affordances can dismiss the detail.
  onClose: () => void
  setOnClose: (fn: () => void) => void
}

const ViewfinderContext = createContext<ViewfinderContextValue>({
  selected: null,
  setSelected: () => {},
  onClose: () => {},
  setOnClose: () => {},
})

export function ViewfinderProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Project | null>(null)
  // Stored as a function value, so updates must use the functional setState form.
  const [onClose, setOnCloseState] = useState<() => void>(() => () => {})
  const setOnClose = (fn: () => void) => setOnCloseState(() => fn)

  return (
    <ViewfinderContext.Provider value={{ selected, setSelected, onClose, setOnClose }}>
      {children}
    </ViewfinderContext.Provider>
  )
}

export function useViewfinder() {
  return useContext(ViewfinderContext)
}

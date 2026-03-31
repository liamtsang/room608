'use client'

import { createContext, useContext } from 'react'

export const TransitionContext = createContext({
  transitioning: false,
})

export function usePageTransition() {
  return useContext(TransitionContext)
}

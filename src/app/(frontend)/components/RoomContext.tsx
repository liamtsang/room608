'use client'

import { createContext, useContext, useState } from 'react'

interface RoomContextValue {
  roomEntered: boolean
  setRoomEntered: (entered: boolean) => void
  // Whether the home-page intro animation has already played. Lives here
  // (above PageTransition) so it survives client-side navigation between pages
  // — returning to `/` from /about won't replay it — but resets on a full page
  // load, so a fresh load or hard refresh plays the intro again.
  introPlayed: boolean
  markIntroPlayed: () => void
}

const RoomContext = createContext<RoomContextValue>({
  roomEntered: true,
  setRoomEntered: () => {},
  introPlayed: false,
  markIntroPlayed: () => {},
})

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [roomEntered, setRoomEntered] = useState(true)
  // State (not a ref) so the persisted value is reliably reflected in context.
  // Setting it re-renders the provider but reconciles children — it does not
  // remount ProjectConveyor, so an in-flight intro keeps running.
  const [introPlayed, setIntroPlayed] = useState(false)

  const markIntroPlayed = () => setIntroPlayed(true)

  return (
    <RoomContext.Provider value={{ roomEntered, setRoomEntered, introPlayed, markIntroPlayed }}>
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  return useContext(RoomContext)
}

'use client'

import { createContext, useContext, useState } from 'react'

interface RoomContextValue {
  roomEntered: boolean
  setRoomEntered: (entered: boolean) => void
}

const RoomContext = createContext<RoomContextValue>({
  roomEntered: true,
  setRoomEntered: () => {},
})

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [roomEntered, setRoomEntered] = useState(true)

  return (
    <RoomContext.Provider value={{ roomEntered, setRoomEntered }}>
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  return useContext(RoomContext)
}

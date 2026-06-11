import React from 'react'
import './styles.css'
import Nav from './components/nav'
import PageTransition from './components/PageTransition'
import { RoomProvider } from './components/RoomContext'
import { ViewfinderProvider } from './components/ViewfinderContext'
import { Viewfinder } from './components/Viewfinder'

export const metadata = {
  description: 'Room 608',
  title: 'Room 608',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <RoomProvider>
          <ViewfinderProvider>
            <div className="block h-[100dvh]">
              <Viewfinder />
              <main className="relative flex-1 h-[100dvh] overflow-hidden">
                <PageTransition>{children}</PageTransition>
              </main>
              <Nav />
            </div>
          </ViewfinderProvider>
        </RoomProvider>
      </body>
    </html>
  )
}

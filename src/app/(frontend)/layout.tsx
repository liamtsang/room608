import React from 'react'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './styles.css'
import Nav from './components/nav'
import PageTransition from './components/PageTransition'
import { RoomProvider } from './components/RoomContext'

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
        {/* Warm the Vimeo connections at page load so focused background videos
            start faster (player doc, thumbnails/assets, and video segments). */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vod-adaptive-ak.vimeocdn.com" />
        <RoomProvider>
          <div className="block h-[100dvh]">
            <main className="relative flex-1 h-[100dvh] overflow-hidden">
              <PageTransition>{children}</PageTransition>
            </main>
            <Nav />
          </div>
        </RoomProvider>
        <DialRoot position="bottom-right" productionEnabled />
      </body>
    </html>
  )
}

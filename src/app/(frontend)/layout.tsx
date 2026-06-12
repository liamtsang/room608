import React from 'react'
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
        <RoomProvider>
          <div className="block h-[100dvh]">
            {/*<div className="fixed h-dvh w-dvw grid grid-cols-3 grid-rows-3 *:border-black *:border-1 z-10 pointer-events-none">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              </div>*/}
            <div className="fixed h-dvh w-dvw z-10 pointer-events-none dot-grid-bg mix-blend-darken"></div>
            <main className="relative flex-1 h-[100dvh] overflow-hidden">
              <PageTransition>{children}</PageTransition>
            </main>
            <Nav />
          </div>
        </RoomProvider>
      </body>
    </html>
  )
}

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
          <Nav />
          <main style={{ position: 'relative', height: '100dvh' }}>
            <PageTransition>{children}</PageTransition>
          </main>
        </RoomProvider>
      </body>
    </html>
  )
}

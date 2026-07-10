import React from 'react'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'
import './styles.css'
import Nav from './components/nav'
import PageTransition from './components/PageTransition'
import { RoomProvider } from './components/RoomContext'
import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site'

const SITE_DESCRIPTION =
  'Room 608 is the documentary studio of Mark Mannucci and Jon Halperin — Emmy- and Peabody-winning films and series for Netflix, PBS, National Geographic, YouTube, TED, and more.'

// A function (not a static object) so getSiteUrl() reads the Worker's runtime
// env per request rather than at module load, where process.env may be empty.
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: 'Room 608',
      template: '%s',
    },
    description: SITE_DESCRIPTION,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
    openGraph: {
      type: 'website',
      siteName: 'Room 608',
      title: 'Room 608',
      description: SITE_DESCRIPTION,
      url: getSiteUrl(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Room 608',
      description: SITE_DESCRIPTION,
    },
  }
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
            <main className="relative flex-1 h-[100dvh] overflow-hidden dot-grid-bg">
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

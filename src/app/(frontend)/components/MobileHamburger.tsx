'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const links = [
  { href: '/', label: 'work' },
  { href: '/about', label: 'about' },
  { href: '/sitemap', label: 'sitemap' },
]

export function MobileHamburger() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-8 z-40 bg-[#282828] border-2 border-[#C6B79C] outline outline-black p-2 flex flex-col gap-[3px]"
        aria-label="Open menu"
      >
        <span className="block w-5 h-[2px] bg-white" />
        <span className="block w-5 h-[2px] bg-white" />
        <span className="block w-5 h-[2px] bg-white" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              key="menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-2/3 max-w-xs bg-[#1f1f1f] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <Image
                  src="/logo hd.png"
                  alt="room608 logo"
                  width={40}
                  height={40}
                  className="border border-[#C6B79C]"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-white text-3xl leading-none px-2"
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>
              {links.map(({ href, label }) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`bg-[#282828] border-2 border-[#C6B79C] outline outline-black px-2 py-1 w-fit ${
                      isActive ? 'text-white font-bold' : 'text-white/60'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

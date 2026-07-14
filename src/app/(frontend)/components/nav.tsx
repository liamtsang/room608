'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const links = [
  { href: '/', label: 'work' },
  { href: '/about', label: 'about' },
  { href: '/sitemap', label: 'sitemap' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex flex-row p-8 fixed top-0 isolate z-10">
      <Image
        src="/logo hd.png"
        alt="room608 logo"
        width={30}
        height={30}
        className="border border-[#C6B79C]"
      />
      {links.map(({ href, label }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`border border-[#C6B79C] border-l-0 w-fit px-2 font-sans ${
              isActive ? 'text-black font-bold' : 'text-[rgba(0,0,0,0.5)] font-normal'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

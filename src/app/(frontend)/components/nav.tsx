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
    <nav className="flex flex-col gap-4 p-8 absolute isolate z-10">
      <Image
        src="/logo hd.png"
        alt="room608 logo"
        width={50}
        height={50}
        className="border border-[#C6B79C]"
      />
      {links.map(({ href, label }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`bg-[#282828] border-2 border-[#C6B79C] outline outline-black px-2 py-0 w-fit ${
              isActive ? 'text-white font-bold' : 'text-[rgba(255,255,255,0.5)] font-normal'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

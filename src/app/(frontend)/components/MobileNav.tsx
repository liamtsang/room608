import Link from 'next/link'
import Image from 'next/image'

const links = [
  { href: '/', label: 'work' },
  { href: '/about', label: 'about' },
  { href: '/sitemap', label: 'sitemap' },
]

export function MobileNav() {
  return (
    <div className="flex flex-col gap-3 mt-8 md:hidden">
      <Image
        src="/logo hd.png"
        alt="room608 logo"
        width={36}
        height={36}
        className="border border-[#C6B79C]"
      />
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="bg-[#282828] border-2 border-[#C6B79C] outline outline-black px-2 py-0 text-white font-bold"
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

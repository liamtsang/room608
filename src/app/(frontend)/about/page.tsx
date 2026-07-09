import Image from 'next/image'
import { MobileHamburger } from '../components/MobileHamburger'

const logos: { src: string; alt: string }[] = [
  { src: '/logos/76th-emmys-gold-logo 1.png', alt: 'Emmy Awards' },
  { src: '/logos/Peabody_Awards_idqmkUud5B_1 1.png', alt: 'Peabody Awards' },
  { src: '/logos/SXSW_Logo_5 1.png', alt: 'SXSW' },
  { src: '/logos/images 1.png', alt: 'Chicago International Film Festival' },
  { src: '/logos/Jackson+Wild+Primary+White 1.png', alt: 'Jackson Wild' },
  { src: '/logos/Wildscreen_Wordmark-Frame-White.png 1.png', alt: 'Wildscreen' },
  {
    src: '/logos/Xx6CdzqTnuxICsiEYz9E_Banff26_logoDates_white 1.png',
    alt: 'Banff World Media Festival',
  },
  { src: '/logos/image 1.png', alt: 'CPB' },
]

const portraits: { src: string; origin: 'left' | 'center' | 'right' }[] = [
  { src: '/portraits/608+Portraits+52.webp', origin: 'left' },
  { src: '/portraits/IMG_0507.webp', origin: 'right' },
  { src: '/portraits/IMG_6028+_281_29+_281_29.webp', origin: 'left' },
  { src: '/portraits/Mark+Mannucci.webp', origin: 'center' },
  { src: '/portraits/MONA_Spring_21.webp', origin: 'center' },
  { src: '/portraits/Ricciardi_01.webp', origin: 'right' },
]

const awards: string[] = [
  '3 News & Documentary Emmy Awards',
  'Primetime Emmy Award',
  '18 Emmy Nominations',
  'Television Academy Honors Award',
  'Wildscreen Award, Best People and Wildlife Film',
  'Jackson Wildlife Award, Outstanding Achievement',
  '4 Daytime Entertainment Emmy Awards',
  '4 Peabody Awards',
  '2 Webby Nominations',
  'SXSW, Audience Award',
  'BANFF, Best Mountain Wildlife and Natural History Award',
  '15 New York Emmy Awards',
  '2 Gold Hugo Awards',
  'Wildscreen Panda Award, Best Series',
]

export default async function About() {
  return (
    <div className="dot-grid-bg min-h-screen">
      <MobileHamburger />
      <div className="p-2 md:p-8 md:pt-24 max-w-5xl mx-auto">
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          {portraits.map(({ src, origin }) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={120}
              height={120}
              className="object-cover aspect-square border-2 border-white outline outline-black w-10% md:w-[15%]"
              style={{ objectPosition: origin }}
            />
          ))}
        </div>

        <div className="bg-[#C6B79C] outline-1 outline-color-[#515151] drop-shadow-md">
          <p>
            Mark Mannucci and Jon Halperin have been collaborating since 2007. In the past 14 years,
            through their company, Room 608, Jon and Mark have made films and series for Amazon,
            YouTube, Netflix, Vox, PBS, PBS Digital, ITVS, The Atlantic, TED, The World, History, and
            National Geographic. Their work has been screened at festivals around the world and In
            2017, they won a National News and Documentary Emmy for Best Science film for A Year In
            Space. Collectively, in their careers, they have won two Peabody Awards, eight Emmys, and
            have been nominated another 18 times. Their most recent series, Breaking the Deadlock,
            has been nominated for two Emmys. Teams at Room 608 can produce anything from vertical
            animated shorts to multimillion dollar international co-productions.
          </p>
        </div>

        <div className="mt-8 bg-[#C6B79C] outline-1 outline-color-[#515151] drop-shadow-md p-4">
          <h2 className="font-bold mb-3">Awards</h2>
          <ul className="grid gap-1 md:grid-cols-2">
            {awards.map((award) => (
              <li key={award}>{award}</li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {logos.map(({ src, alt }) => (
            <Image
              key={src}
              src={src}
              alt={alt}
              width={120}
              height={60}
              className="h-8 md:h-12 mb-2 md:mb-0 w-auto object-contain select-none invert mix-blend-darken"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

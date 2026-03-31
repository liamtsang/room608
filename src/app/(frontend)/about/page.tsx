import Image from 'next/image'

const portraits: { src: string; origin: 'left' | 'center' | 'right' }[] = [
  { src: '/portraits/608+Portraits+52.webp', origin: 'left' },
  { src: '/portraits/IMG_0507.webp', origin: 'right' },
  { src: '/portraits/IMG_6028+_281_29+_281_29.webp', origin: 'left' },
  { src: '/portraits/Mark+Mannucci.webp', origin: 'center' },
  { src: '/portraits/MONA_Spring_21.webp', origin: 'center' },
  { src: '/portraits/Ricciardi_01.webp', origin: 'right' },
]

export default async function About() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1024px', margin: '0 auto', paddingTop: '6rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}
      >
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
          Mark Mannucci and Jon Halperin have been collaborating since 2007. Jon had been a fan of
          Mark&apos;s PBS series Egg The Arts Show, so when he was tapped to EP National Geographic
          Explorer his very first directing hire was Mark. Mark went on to make six films for Jon at
          Explorer. His films were among the highest rated on the series and won some of the most
          prestigious awards in television. When Jon decided to leave Geographic in 2012 and move to
          New York, the two decided to hang a shingle together with a simple mission: build a
          company of filmmakers and craftspeople who value intense collaboration and creatively
          challenging projects. Their first office was in the heart of Hell&apos;s Kitchen and is
          now located just north of the city on the Hudson River in a 100-year-old brewery building.
          Both offices were built around large open spaces where ideas can be exchanged freely.
        </p>
        <p className="min-w-[55ch]"></p>
        <p>
          To work at Room 608, one has to be creatively fearless, willing to take risks, to work
          fluidly with others — in other words you have to be smart and enjoy the process of
          creating as a team. Jon and Mark love to nurture the creativity and imagination of their
          teams – as gratifying as that is for them personally, the ultimate benefit is work that
          everyone can all be proud of: that is imaginative, high-quality, and profitable.
        </p>
        <p className="min-w-[55ch]"></p>
        <p>
          In the past eight years, Jon and Mark have made films and series for Amazon, Netflix, Vox,
          PBS, PBS Digital, ITVS, The Atlantic, The World, History, and National Geographic. Their
          work has been screened at festivals around the world and In 2017, they won a National News
          and Documentary Emmy for Best Science film for A Year In Space. Collectively, in their
          careers, they have won two Peabody Awards, seven Emmys, and have been nominated another 14
          times. They are currently producing a kids&apos; music series for a major streamer, a
          feature documentary for Netflix, a feature documentary for Time, and a five-hour series
          for PBS.
        </p>
        <p className="min-w-[55ch]"></p>
        <p>
          Jon and Mark are interested in telling the best factual stories, in the most visually
          stimulating way they can, with the most creative and talented craftspeople in the
          business. Their ideas stretch across the whole of factual - science, history, crime, even
          horror. Teams at Room 608 can produce and direct everything from innovative animation to
          intimate verite documentaries.
        </p>
      </div>
    </div>
  )
}

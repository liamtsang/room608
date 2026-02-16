import { useEffect, useRef } from 'react'
import type { Project, Media } from '@/payload-types'

export function useImagePrefetch(projects: Project[]) {
  const loaded = useRef(new Set<string>())

  useEffect(() => {
    for (const project of projects) {
      const images = (project.images ?? []).filter(
        (img): img is Media => typeof img !== 'number',
      )

      for (const img of images) {
        if (img.url && !loaded.current.has(img.url)) {
          const el = new Image()
          el.src = img.url
          loaded.current.add(img.url)
        }
      }
    }
  }, [projects])
}

'use client'

import { Fragment, useEffect, useRef, useState, type SyntheticEvent } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  usePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from 'motion/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import VimeoPlayer from '@vimeo/player'
import { useDialKit } from 'dialkit'
import type { Media, Project } from '@/payload-types'
import { FlipCell, groupCredits } from './CreditFlip'

const ROW_COUNT = 3
const TILE_GAP = 0
// Wheel deltas land in big discrete jumps; scale down per-tick step so the
// spring has room to smooth between events.
const DEFAULT_WHEEL_STEP = 0.85
const DEFAULT_SPRING = { stiffness: 158, damping: 28, mass: 0.4 }
// Multiplier on tileWidth used as the minimum off-screen pad per row side.
// 1 = exactly one tile of off-screen pad (smooth row-to-row teleport).
const DEFAULT_PAD_FACTOR = 1
// Park hidden tiles far enough left that they can't bleed into a neighbour.
const OFFSCREEN = -99999
// Intro: tiles file along the serpentine path as if scrolled forward.
const INTRO_DURATION = 6
const INTRO_EASE = [0.16, 1, 0.3, 1] as const
// Reveal motion for the detail panel slide and the credit-card pop. Authored
// in DialKit's "simple" (visualDuration/bounce) mode.
const DETAIL_SPRING = { type: 'spring' as const, visualDuration: 0.35, bounce: 0 }
const CREDIT_SPRING = { type: 'spring' as const, visualDuration: 0.25, bounce: 0 }

function firstImage(project: Project): Media | null {
  const images = (project.images ?? []).filter((img): img is Media => typeof img !== 'number')
  return images[0] ?? null
}

// Turn a stored Vimeo URL into a clean, chromeless embed: looping autoplay
// with no player UI. We deliberately avoid Vimeo's background=1 mode because it
// force-mutes with no runtime control — instead we start muted (so autoplay is
// always allowed and the video buffers on hover) and unmute at runtime via the
// Player SDK once the tile is focused by a click. Preserves the privacy hash
// (?h=) that unlisted videos need. Returns null if no id can be parsed.
function vimeoEmbedSrc(raw: string | null | undefined): string | null {
  if (!raw) return null
  const id = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
  if (!id) return null
  const hash = raw.match(/[?&](?:amp;)?h=([0-9a-f]+)/i)?.[1]
  const params = new URLSearchParams({
    autoplay: '1',
    muted: '1',
    loop: '1',
    autopause: '0',
    controls: '0',
    title: '0',
    byline: '0',
    portrait: '0',
    playsinline: '1',
  })
  if (hash) params.set('h', hash)
  return `https://player.vimeo.com/video/${id}?${params}`
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

type PathParams = {
  index: number
  rowIdx: number
  itemSpacing: number
  totalLen: number
  segLen: number
  offPad: number
}

// Screen x of a tile for a given scroll value s and intro progress p. Returns
// OFFSCREEN when the tile's virtual position falls outside this row's segment.
function pathX(s: number, p: number, { index, rowIdx, itemSpacing, totalLen, segLen, offPad }: PathParams) {
  if (segLen <= 0 || totalLen <= 0 || itemSpacing <= 0) return OFFSCREEN
  let v = index * itemSpacing + s + (p - 1) * totalLen
  if (p >= 0.9999) v = mod(v, totalLen)
  const itemRow = Math.floor(v / segLen)
  if (itemRow !== rowIdx) return OFFSCREEN
  const localV = v - itemRow * segLen
  const isLTR = rowIdx % 2 === 0
  return isLTR ? localV - offPad : segLen - localV - offPad
}

// Tint blended into the duplicate background image when faded. Adjust to
// taste — neutrals desaturate, hues recolor.
const FADE_TINT = '#C6B79C'

type CardStyle = {
  radius: number
  borderWidth: number
  borderColor: string
  hoverScale: number
  tapScale: number
}

type FadeStyle = {
  tint: string
  bgOpacity: number
  fadedOpacity: number
  duration: number
  fastExit: number
  restore: number
}

function Tile({
  project,
  onClick,
  faded,
  focused,
  active,
  preload,
  card,
  fade,
}: {
  project: Project
  onClick: () => void
  faded: boolean
  focused: boolean
  // Whether this tile copy is the on-screen one for its project. Each project
  // is rendered once per row (3 copies) and only one is ever on screen, so we
  // gate the video mount on this to avoid buffering — and unmuting — the two
  // off-screen duplicates of the focused project.
  active: boolean
  // Preload the video (mount buffering + muted, invisible) even when not
  // hovered or focused — used for the focused item's neighbours so arrow/scroll
  // navigation plays them instantly.
  preload: boolean
  card: CardStyle
  fade: FadeStyle
}) {
  const thumb = firstImage(project)
  const scan =
    project.scanEffect && typeof project.scanEffect === 'object' ? project.scanEffect : null
  const vimeoSrc = vimeoEmbedSrc(project.vimeoUrl)
  const [hovered, setHovered] = useState(false)
  // Mount the iframe on hover (or when it's a focused item's neighbour) so the
  // video buffers silently and is ready to play the instant the tile is
  // focused; keep it mounted while focused. Only the on-screen copy mounts, so
  // we never load the two off-screen duplicates or 20+ tiles at once.
  const mountVideo = (hovered || focused || preload) && active && !!vimeoSrc
  // When this tile is the focused one, the still image fades out and the video
  // becomes visible (and unmuted). During a hover-only preload the video stays
  // invisible behind the still.
  const showVideo = focused && !!vimeoSrc
  const [audioMuted, setAudioMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<VimeoPlayer | null>(null)

  // Build the Vimeo Player once the iframe mounts; tear it down on unmount.
  useEffect(() => {
    if (!mountVideo || !iframeRef.current) return
    const player = new VimeoPlayer(iframeRef.current)
    playerRef.current = player
    return () => {
      playerRef.current = null
      player.destroy().catch(() => {})
    }
  }, [mountVideo])

  // Unmute when focused (the focus click is a user gesture, so the browser
  // allows unmuting the already-playing muted video); re-mute during a
  // hover-only preload so it keeps buffering silently.
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (focused) {
      setAudioMuted(false)
      player.setMuted(false).catch(() => {})
      player.setVolume(1).catch(() => {})
      player.play().catch(() => {})
    } else {
      player.setMuted(true).catch(() => {})
    }
  }, [focused, mountVideo])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {})
    } else {
      frameRef.current?.requestFullscreen?.().catch(() => {})
    }
  }

  const goFullscreen = (e: SyntheticEvent) => {
    e.stopPropagation()
    toggleFullscreen()
  }

  const toggleMuteCore = () => {
    const player = playerRef.current
    if (!player) return
    const next = !audioMuted
    setAudioMuted(next)
    player.setMuted(next).catch(() => {})
    if (!next) player.setVolume(1).catch(() => {})
  }

  const toggleMute = (e: SyntheticEvent) => {
    e.stopPropagation()
    toggleMuteCore()
  }

  // Keyboard shortcuts while this tile is the focused, on-screen one:
  // "f" toggles fullscreen, "m" toggles mute.
  useEffect(() => {
    if (!focused || !active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        toggleMuteCore()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, active, audioMuted])
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: card.hoverScale, zIndex: 2 }}
      whileTap={{ scale: card.tapScale }}
      onHoverStart={() => {
        setHovered(true)
        void videoRef.current?.play()
      }}
      onHoverEnd={() => {
        setHovered(false)
        const video = videoRef.current
        if (video) {
          video.pause()
          video.currentTime = 0
        }
      }}
      className="text-left h-full"
    >
      <div className="p-2 flex flex-col gap-2 h-full">
        {thumb?.url ? (
          <motion.div
            ref={frameRef}
            className="overflow-hidden outline-1 aspect-[16/9] h-full relative"
            style={{
              borderRadius: card.radius,
              borderBottomStyle: 'solid',
              borderBottomWidth: card.borderWidth,
            }}
            animate={{
              outlineColor: faded ? `${card.borderColor}00` : `${card.borderColor}ff`,
              borderBottomColor: faded ? `${card.borderColor}00` : `${card.borderColor}ff`,
            }}
            transition={{ duration: fade.duration, ease: 'easeInOut' }}
          >
            {/* Color-blended bg layer revealed as the foreground fades. */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${thumb.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: fade.tint,
                backgroundBlendMode: 'color',
                opacity: fade.bgOpacity,
              }}
            />
            {/* Foreground image fades out to reveal the bg layer. Blend mode
                never changes, so the transition is smooth. */}
            <motion.img
              src={thumb.url}
              alt={thumb.alt ?? project.title}
              draggable={false}
              className="w-full h-full object-cover select-none relative"
              animate={{ opacity: showVideo ? 0 : faded ? fade.fadedOpacity : 1 }}
              transition={{ duration: fade.duration, ease: 'easeInOut' }}
            />
            {/* Laser-scan overlay: screen-blend drops the black, leaving only the
                laser over the photo. Only loads/plays on hover. */}
            {scan?.url && (
              <motion.video
                ref={videoRef}
                src={scan.url}
                muted
                playsInline
                preload="none"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                style={{ mixBlendMode: 'screen' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: hovered ? 0.6 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            )}
            {/* Vimeo player: mounts on hover so the video buffers silently
                (preload), then crossfades in and unmutes over the still image
                once the tile is focused. The iframe is oversized a few px and
                centered so Vimeo's hairline pillarbox is clipped by the frame —
                no gap on the sides. */}
            <AnimatePresence>
              {mountVideo && (
                <motion.div
                  key="vimeo"
                  className="absolute inset-0 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showVideo ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fade.duration, ease: 'easeInOut' }}
                >
                  <iframe
                    ref={iframeRef}
                    src={vimeoSrc!}
                    title={project.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    className="absolute top-1/2 left-1/2 pointer-events-none"
                    style={{
                      border: 0,
                      width: 'calc(100% + 16px)',
                      height: 'calc(100% + 16px)',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  {showVideo && (
                    <>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={audioMuted ? 'Unmute' : 'Mute'}
                        onClick={toggleMute}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') toggleMute(e)
                        }}
                        className="absolute bottom-2 right-12 grid place-items-center w-8 h-8 rounded bg-black/45 text-white/90 hover:bg-black/65 pointer-events-auto cursor-pointer transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M11 5 6 9H2v6h4l5 4V5z" />
                          {audioMuted ? (
                            <path d="m23 9-6 6M17 9l6 6" />
                          ) : (
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                          )}
                        </svg>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="Fullscreen"
                        onClick={goFullscreen}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') goFullscreen(e)
                        }}
                        className="absolute bottom-2 right-2 grid place-items-center w-8 h-8 rounded bg-black/45 text-white/90 hover:bg-black/65 pointer-events-auto cursor-pointer transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
                        </svg>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div
            className="outline-2 outline-[#3D3D3D] bg-[#b3a488] aspect-[16/9] h-full"
            style={{ borderRadius: card.radius }}
          />
        )}
      </div>
    </motion.button>
  )
}

function PathTile({
  project,
  index,
  rowIdx,
  scroll,
  scrollTarget,
  introProgress,
  segLen,
  totalLen,
  itemSpacing,
  offPad,
  rowWidth,
  tilePitch,
  verticalPitch,
  onSelect,
  onClose,
  selected,
  preload,
  gridFaded,
  navigating,
  fastExitRef,
  card,
  fade,
  detailSpring,
  creditSpring,
  innerRef,
}: {
  project: Project
  index: number
  rowIdx: number
  scroll: MotionValue<number>
  scrollTarget: MotionValue<number>
  introProgress: MotionValue<number>
  segLen: number
  totalLen: number
  itemSpacing: number
  offPad: number
  rowWidth: number
  tilePitch: number
  verticalPitch: number
  onSelect: (id: number) => void
  onClose?: () => void
  selected: boolean
  preload: boolean
  gridFaded: boolean
  navigating: boolean
  fastExitRef: { current: boolean }
  card: CardStyle
  fade: FadeStyle
  detailSpring: SpringOptions
  creditSpring: SpringOptions
  innerRef?: (el: HTMLDivElement | null) => void
}) {
  // Virtual position v walks a closed serpentine path of length totalLen,
  // split into ROW_COUNT segments of segLen each. When v crosses a segment
  // boundary the tile teleports to the next row at its off-screen edge —
  // invisible because the off-screen pad is wider than a tile.
  //
  // During intro (introProgress < 1), v is shifted by (p-1)*totalLen and
  // mod is skipped so tiles can sit at v < 0 (off-screen left of row 0)
  // and slide rightward into resting positions as if scrolled forward.
  const pathParams = { index, rowIdx, itemSpacing, totalLen, segLen, offPad }
  const x = useTransform([scroll, introProgress], ([s, p]: number[]) => pathX(s, p, pathParams))

  // Only one of a project's three row copies is on screen at a time (the others
  // sit at x = OFFSCREEN). Track that so the video only mounts on the visible
  // copy — otherwise the focused item's two off-screen duplicates would also
  // buffer and unmute.
  const [onScreen, setOnScreen] = useState(() => x.get() > OFFSCREEN / 2)
  useEffect(() => {
    const update = (v: number) => setOnScreen(v > OFFSCREEN / 2)
    update(x.get())
    return x.on('change', update)
  }, [x])

  const tileFaded = gridFaded && !selected

  // While the panel is mounted (including its exit slide-back), keep the
  // tile above it so the panel slides back behind the image, not over it.
  // But when *another* tile is now selected (a nav step), this tile is
  // retracting + fading — drop it below so its semi-transparent image doesn't
  // sit over the incoming panel.
  const [panelMounted, setPanelMounted] = useState(false)
  useEffect(() => {
    if (selected) setPanelMounted(true)
  }, [selected])
  const panelAbove = panelMounted && (selected || !gridFaded)
  // The item being navigated away from: snap it out fast so it doesn't linger
  // and cross over the incoming item.
  const retracting = panelMounted && !selected && gridFaded

  // During a nav step the panel mounts while the tile is still sliding into
  // its slot, so tileX.get() is transient. Compute the slide direction from
  // where the tile will *rest* (its position at the scroll target) so the
  // "open toward the side with more room" choice isn't fooled.
  const dirOverride: 1 | -1 | undefined =
    selected && navigating
      ? pathX(scrollTarget.get(), introProgress.get(), pathParams) + tilePitch / 2 < rowWidth / 2
        ? 1
        : -1
      : undefined

  // When something is already selected, clicks on any tile close — never
  // open another. Without this, clicking a faded tile would simultaneously
  // close the current panel and open a new one.
  const handleTileClick = () => {
    if (gridFaded) onClose?.()
    else onSelect(project.id)
  }

  return (
    <>
      <AnimatePresence>
        {selected && rowWidth > 0 && tilePitch > 0 && (
          <SlidePanel
            key={`panel-${project.id}`}
            project={project}
            tileX={x}
            rowWidth={rowWidth}
            tilePitch={tilePitch}
            card={card}
            spring={detailSpring}
            dirOverride={dirOverride}
            fastExitRef={fastExitRef}
            fastExitDuration={fade.fastExit}
            onExitComplete={() => setPanelMounted(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selected && verticalPitch > 0 && (
          <VerticalPanel
            key={`vpanel-${project.id}`}
            project={project}
            tileX={x}
            verticalPitch={verticalPitch}
            card={card}
            spring={creditSpring}
            fastExitRef={fastExitRef}
            fastExitDuration={fade.fastExit}
            // top rows pop down, the bottom row pops up
            dir={rowIdx === ROW_COUNT - 1 ? -1 : 1}
          />
        )}
      </AnimatePresence>
      <motion.div
        ref={innerRef}
        style={{
          x,
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: panelAbove ? 2 : 0,
        }}
        animate={{ opacity: retracting ? 0 : 1 }}
        transition={{ duration: retracting ? fade.fastExit : fade.restore, ease: 'easeOut' }}
      >
        <Tile
          project={project}
          onClick={handleTileClick}
          faded={tileFaded}
          focused={selected}
          active={onScreen}
          preload={preload}
          card={card}
          fade={fade}
        />
      </motion.div>
    </>
  )
}

// Slide-out detail panel: rides on the selected tile's x, plus an animated
// offset that springs to ±tilePitch (chosen by which side of the row the
// tile sits on) so the panel emerges from behind the tile into the next
// tile's slot. Uses usePresence to reverse the slide on exit.
function SlidePanel({
  project,
  tileX,
  rowWidth,
  tilePitch,
  card,
  spring,
  dirOverride,
  fastExitRef,
  fastExitDuration = 0.1,
  onExitComplete,
}: {
  project: Project
  tileX: MotionValue<number>
  rowWidth: number
  tilePitch: number
  card: CardStyle
  spring: SpringOptions
  dirOverride?: 1 | -1
  fastExitRef?: { current: boolean }
  fastExitDuration?: number
  onExitComplete?: () => void
}) {
  const [isPresent, safeToRemove] = usePresence()
  const [dir] = useState<1 | -1>(
    () => dirOverride ?? (tileX.get() + tilePitch / 2 < rowWidth / 2 ? 1 : -1),
  )
  const offset = useMotionValue(0)
  const opacity = useMotionValue(1)
  const x = useTransform([tileX, offset], ([t, o]: number[]) => t + o)

  useEffect(() => {
    if (isPresent) {
      const ctrl = animate(offset, dir * tilePitch, spring)
      return () => ctrl.stop()
    }
    // Nav step: the previous item snaps out fast instead of folding back.
    if (fastExitRef?.current) {
      const ctrl = animate(opacity, 0, { duration: fastExitDuration, ease: 'easeOut' })
      ctrl.then(() => {
        onExitComplete?.()
        safeToRemove?.()
      })
      return () => ctrl.stop()
    }
    const ctrl = animate(offset, 0, spring)
    ctrl.then(() => {
      onExitComplete?.()
      safeToRemove?.()
    })
    return () => ctrl.stop()
  }, [
    isPresent,
    dir,
    tilePitch,
    offset,
    opacity,
    spring,
    fastExitRef,
    fastExitDuration,
    safeToRemove,
    onExitComplete,
  ])

  return (
    <motion.div
      style={{
        x,
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 1,
      }}
    >
      <DetailPanel project={project} card={card} />
    </motion.div>
  )
}

function DetailPanel({ project, card }: { project: Project; card: CardStyle }) {
  return (
    <div className="text-left h-full pointer-events-auto">
      <div className="p-2 flex flex-col gap-2 h-full">
        <div
          className="overflow-hidden outline outline-black aspect-[16/9] h-full bg-[#C6B79C] flex flex-col gap-2"
          style={{
            borderRadius: card.radius,
            borderBottomStyle: 'solid',
            borderBottomWidth: card.borderWidth,
            borderBottomColor: card.borderColor,
          }}
        >
          {project.description ? (
            <div className="text-sm flex-1 overflow-y-auto pr-1">
              <RichText data={project.description} />
            </div>
          ) : (
            <div className="text-xs opacity-60">No description.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// Title/credits card that pops vertically out from behind the selected tile —
// down for the top rows, up for the bottom row. Mirrors SlidePanel's emerge-
// from-behind motion on the Y axis. Four boxed quadrants: label / value ×2.
function CreditCard({ project, dir, card }: { project: Project; dir: 1 | -1; card: CardStyle }) {
  // dir 1 = popping down → sit at the top of the slot (just below the tile);
  // dir -1 = popping up → sit at the bottom of the slot (just above the tile).
  return (
    <div className="text-left h-full pointer-events-none">
      <div
        className={`p-2 flex flex-col gap-2 h-full ${dir === 1 ? 'justify-start' : 'justify-end'}`}
      >
        <div
          className="w-full bg-[#C6B79C] outline outline-black p-2 grid grid-cols-[auto_1fr] gap-2 content-center"
          style={{
            borderRadius: card.radius,
            borderBottomStyle: 'solid',
            borderBottomWidth: card.borderWidth,
            borderBottomColor: card.borderColor,
          }}
        >
          <div className="outline-1 outline-[#3D3D3D] px-3 py-2 text-sm text-center">Title</div>
          <div className="outline-1 outline-[#3D3D3D] px-3 py-2 text-sm max-w-[30ch]">
            {project.title}
          </div>
          {groupCredits(project.credits ?? []).map((row, i) => {
            const cell = 'outline-1 outline-[#3D3D3D] px-3 py-2 text-sm'
            if (row.kind === 'person') {
              return (
                <Fragment key={i}>
                  <FlipCell values={row.roles} className={`${cell} text-center`} />
                  <div className={cell}>{row.name}</div>
                </Fragment>
              )
            }
            if (row.kind === 'role') {
              return (
                <Fragment key={i}>
                  <div className={`${cell} text-center`}>{row.role}</div>
                  <FlipCell values={row.names} className={cell} />
                </Fragment>
              )
            }
            return (
              <Fragment key={i}>
                <div className={`${cell} text-center`}>{row.role}</div>
                <div className={cell}>{row.name}</div>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Vertical analog of SlidePanel: rides on the selected tile's x (horizontal
// alignment), springs a y offset to ±verticalPitch so the credit card emerges
// from behind the tile into the adjacent row slot.
function VerticalPanel({
  project,
  tileX,
  verticalPitch,
  dir,
  card,
  spring,
  fastExitRef,
  fastExitDuration = 0.1,
  onExitComplete,
}: {
  project: Project
  tileX: MotionValue<number>
  verticalPitch: number
  dir: 1 | -1
  card: CardStyle
  spring: SpringOptions
  fastExitRef?: { current: boolean }
  fastExitDuration?: number
  onExitComplete?: () => void
}) {
  const [isPresent, safeToRemove] = usePresence()
  const offsetY = useMotionValue(0)
  const opacity = useMotionValue(1)
  const x = useTransform(tileX, (t) => t)

  useEffect(() => {
    if (isPresent) {
      const ctrl = animate(offsetY, dir * verticalPitch, spring)
      return () => ctrl.stop()
    }
    // Nav step: snap out fast instead of folding back into the tile.
    if (fastExitRef?.current) {
      const ctrl = animate(opacity, 0, { duration: fastExitDuration, ease: 'easeOut' })
      ctrl.then(() => {
        onExitComplete?.()
        safeToRemove?.()
      })
      return () => ctrl.stop()
    }
    const ctrl = animate(offsetY, 0, spring)
    ctrl.then(() => {
      onExitComplete?.()
      safeToRemove?.()
    })
    return () => ctrl.stop()
  }, [
    isPresent,
    dir,
    verticalPitch,
    offsetY,
    opacity,
    spring,
    fastExitRef,
    fastExitDuration,
    safeToRemove,
    onExitComplete,
  ])

  return (
    <motion.div
      style={{
        x,
        y: offsetY,
        opacity,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 1,
        // Display-only card: let clicks fall through so the empty space above/
        // below it doesn't swallow click-to-close.
        pointerEvents: 'none',
      }}
    >
      <CreditCard project={project} dir={dir} card={card} />
    </motion.div>
  )
}

export function ProjectConveyor({
  projects,
  onSelect,
  onClose,
  selectedId = null,
}: {
  projects: Project[]
  onSelect: (id: number) => void
  onClose?: () => void
  selectedId?: number | null
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const dials = useDialKit(
    'Conveyor',
    {
      motion: {
        wheelStep: [DEFAULT_WHEEL_STEP, 0.05, 10, 0.05],
        scrollSpring: { type: 'spring', ...DEFAULT_SPRING },
        padFactor: [DEFAULT_PAD_FACTOR, 0, 3, 0.05],
        detailSpring: { ...DETAIL_SPRING },
        creditSpring: { ...CREDIT_SPRING },
        introDuration: [INTRO_DURATION, 0, 12, 0.5],
        navSettle: [0.5, 0.05, 5, 0.05], // scroll-arrival threshold that ends a nav step
        navTimeout: [1200, 200, 4000, 50], // ms fallback if the scroll never settles
      },
      cards: {
        gap: [TILE_GAP, 0, 64, 1],
        radius: [0, 0, 32, 1],
        borderWidth: [4, 0, 16, 1],
        borderColor: '#000000',
        hoverScale: [1.01, 1, 1.25, 0.01],
        tapScale: [0.97, 0.8, 1, 0.01],
      },
      fade: {
        tint: FADE_TINT, // color blended into the duplicate bg layer when faded
        bgOpacity: [0.5, 0, 1, 0.05], // opacity of that tinted bg layer
        fadedOpacity: [0, 0, 1, 0.05], // target opacity of a faded tile's image
        duration: [0.4, 0, 2, 0.05], // fade-to-tint / outline fade duration
        fastExit: [0.1, 0, 1, 0.01], // nav: how fast the leaving item snaps out
        restore: [0.4, 0, 2, 0.05], // nav: how slowly it eases back to a grid tile
      },
      dots: {
        bg: '#e0e0e0',
        color: '#919191',
        size: [2, 0, 12, 1],
        space: [64, 4, 96, 1],
      },
    },
    { id: 'conveyor', persist: true }, // tweaks survive reloads
  )

  // Sync the dot-grid controls onto <body>, where .dot-grid-bg reads them.
  useEffect(() => {
    const s = document.body.style
    s.setProperty('--dot-bg', dials.dots.bg)
    s.setProperty('--dot-color', dials.dots.color)
    s.setProperty('--dot-size', `${dials.dots.size}px`)
    s.setProperty('--dot-space', `${dials.dots.space}px`)
  }, [dials.dots.bg, dials.dots.color, dials.dots.size, dials.dots.space])

  const scrollTarget = useMotionValue(0)
  const scroll = useSpring(scrollTarget, dials.motion.scrollSpring as SpringOptions)
  const introProgress = useMotionValue(0)
  const introStartedRef = useRef(false)

  // Next/back navigation while focused. `navigating` keeps the grid faded
  // through the brief selectedId → null → nextId window so the whole grid
  // doesn't flash un-faded mid-step. `navLock` guards the sequence against
  // re-entry (rapid wheel/keys). `navigateRef` holds the latest closure so
  // the wheel/keydown listeners stay stable.
  const [navigating, setNavigating] = useState(false)
  const navLock = useRef(false)
  const navigateRef = useRef<(dir: 1 | -1) => void>(() => {})
  // True only while a nav step is exiting the previous item, so its panels
  // snap out fast instead of doing the slow fold-back of a normal close.
  const fastExitRef = useRef(false)

  // Faded whenever something is focused, and held faded across a nav step.
  const gridFaded = selectedId != null || navigating

  const [rowEl, setRowEl] = useState<HTMLDivElement | null>(null)
  const [tileEl, setTileEl] = useState<HTMLDivElement | null>(null)
  const [rowWidth, setRowWidth] = useState(0)
  const [tileWidth, setTileWidth] = useState(0)
  const [tileHeight, setTileHeight] = useState(0)

  useEffect(() => {
    if (!rowEl) return
    const update = () => setRowWidth(rowEl.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(rowEl)
    return () => ro.disconnect()
  }, [rowEl])

  useEffect(() => {
    if (!tileEl) return
    const update = () => {
      const rect = tileEl.getBoundingClientRect()
      setTileWidth(rect.width)
      setTileHeight(rect.height)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(tileEl)
    return () => ro.disconnect()
  }, [tileEl])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // While focused, a wheel gesture steps next/back instead of scrolling.
      // navigate() guards re-entry, so one settled step per gesture.
      if (selectedId != null) {
        navigateRef.current(e.deltaY + e.deltaX > 0 ? 1 : -1)
        return
      }
      scrollTarget.set(scrollTarget.get() + (e.deltaY + e.deltaX) * dials.motion.wheelStep)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scrollTarget, dials.motion.wheelStep, selectedId])

  // When selection happens, snap the spring's target to the current value so
  // any in-flight scroll motion stops drifting under the detail panel. Skip
  // during a nav step — there scroll is already parked exactly at its target.
  useEffect(() => {
    if (selectedId != null && !navLock.current) scrollTarget.set(scroll.get())
  }, [selectedId, scrollTarget, scroll])

  // Arrow keys step next/back while focused (←/↑ back, →/↓ next).
  useEffect(() => {
    if (selectedId == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        navigateRef.current(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        navigateRef.current(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  // Kick off the file-in intro once dimensions are known. introProgress 0→1
  // shifts every tile from off-screen left to its resting serpentine position.
  useEffect(() => {
    if (introStartedRef.current) return
    if (rowWidth <= 0 || tileWidth <= 0) return
    introStartedRef.current = true
    const controls = animate(introProgress, 1, {
      duration: dials.motion.introDuration,
      ease: INTRO_EASE,
    })
    return () => controls.stop()
  }, [rowWidth, tileWidth, introProgress, dials.motion.introDuration])

  if (projects.length === 0) return null

  const N = projects.length
  const tilePitch = tileWidth + dials.cards.gap
  // Row-to-row vertical pitch (tile height + the gap-4 between rows), used as
  // the distance the credit card pops up/down out of the tile.
  const verticalPitch = tileHeight + dials.cards.gap
  // Pack items tightly when N supports it; otherwise stretch to keep
  // off-screen pad >= tileWidth so row-to-row teleports stay invisible.
  const baseSegLen = (N * tilePitch) / ROW_COUNT
  const minSegLen = rowWidth + 2 * tileWidth * dials.motion.padFactor
  const segLen = Math.max(baseSegLen, minSegLen)
  const totalLen = ROW_COUNT * segLen
  const itemSpacing = totalLen / N
  const offPad = (segLen - rowWidth) / 2

  // While an item is focused, preload its immediate neighbours (the projects
  // one step back/forward, matching navigateRef's wrap logic) so an arrow-key
  // or wheel step plays the next video instantly instead of buffering on land.
  const selIdx = selectedId != null ? projects.findIndex((p) => p.id === selectedId) : -1
  const preloadIds =
    selIdx >= 0
      ? new Set([projects[(selIdx - 1 + N) % N].id, projects[(selIdx + 1) % N].id])
      : null

  // Step to the next/previous project in the sequence (wraps at the ends).
  // Shifting scroll by one itemSpacing lands the neighbour project in the
  // exact slot the current one occupies. We swap the selection straight from
  // A → B (never through null) and start the scroll at the same instant, so
  // the current panel's retract, the slide-into-slot, and the next panel's
  // open all play concurrently in one animation window.
  navigateRef.current = (dir: 1 | -1) => {
    if (selectedId == null || navLock.current || itemSpacing <= 0) return
    const idx = projects.findIndex((p) => p.id === selectedId)
    if (idx < 0) return
    const nextId = projects[(idx + dir + N) % N].id

    navLock.current = true
    fastExitRef.current = true
    setNavigating(true)

    const dest = scrollTarget.get() - dir * itemSpacing
    scrollTarget.set(dest)
    onSelect(nextId) // A snaps out fast + B opens, riding the in-flight scroll

    // Release the re-entry lock once the conveyor has parked B in the slot.
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      unsub()
      clearTimeout(timer)
      fastExitRef.current = false
      setNavigating(false)
      navLock.current = false
    }
    const unsub = scroll.on('change', (v: number) => {
      if (Math.abs(v - dest) < dials.motion.navSettle) finish()
    })
    const timer = setTimeout(finish, dials.motion.navTimeout)
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex h-full flex-col justify-center gap-4 py-4"
        onClick={(e) => {
          // Click on empty conveyor space (not on a tile) closes the detail.
          if (selectedId != null && e.target === e.currentTarget && onClose) onClose()
        }}
      >
        {[0, 1, 2].map((rowIdx) => (
          <div
            key={rowIdx}
            ref={rowIdx === 0 ? setRowEl : undefined}
            className="h-1/4 relative"
            // clip the conveyor horizontally, but let the credit card pop out
            // vertically (overflow-x:clip doesn't force overflow-y to auto)
            style={{ overflowX: 'clip', overflowY: 'visible' }}
            onClick={(e) => {
              if (selectedId != null && e.target === e.currentTarget && onClose) onClose()
            }}
          >
            {projects.map((project, i) => (
              <PathTile
                key={project.id}
                project={project}
                index={i}
                rowIdx={rowIdx}
                scroll={scroll}
                scrollTarget={scrollTarget}
                introProgress={introProgress}
                segLen={segLen}
                totalLen={totalLen}
                itemSpacing={itemSpacing}
                offPad={offPad}
                rowWidth={rowWidth}
                tilePitch={tilePitch}
                verticalPitch={verticalPitch}
                onSelect={onSelect}
                onClose={onClose}
                selected={project.id === selectedId}
                preload={preloadIds?.has(project.id) ?? false}
                gridFaded={gridFaded}
                navigating={navigating}
                fastExitRef={fastExitRef}
                card={{
                  radius: dials.cards.radius,
                  borderWidth: dials.cards.borderWidth,
                  borderColor: dials.cards.borderColor,
                  hoverScale: dials.cards.hoverScale,
                  tapScale: dials.cards.tapScale,
                }}
                fade={{
                  tint: dials.fade.tint,
                  bgOpacity: dials.fade.bgOpacity,
                  fadedOpacity: dials.fade.fadedOpacity,
                  duration: dials.fade.duration,
                  fastExit: dials.fade.fastExit,
                  restore: dials.fade.restore,
                }}
                detailSpring={dials.motion.detailSpring as SpringOptions}
                creditSpring={dials.motion.creditSpring as SpringOptions}
                innerRef={rowIdx === 0 && i === 0 ? setTileEl : undefined}
              />
            ))}
          </div>
        ))}
      </div>

      {selectedId != null && (
        <>
          <button
            type="button"
            onClick={() => navigateRef.current(-1)}
            disabled={navigating}
            aria-label="Previous project"
            className="fixed top-1/2 left-4 z-30 -translate-y-1/2 bg-[#282828] border-2 border-[#C6B79C] outline outline-black px-3 py-2 text-white font-bold disabled:opacity-50"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => navigateRef.current(1)}
            disabled={navigating}
            aria-label="Next project"
            className="fixed top-1/2 right-4 z-30 -translate-y-1/2 bg-[#282828] border-2 border-[#C6B79C] outline outline-black px-3 py-2 text-white font-bold disabled:opacity-50"
          >
            →
          </button>
        </>
      )}
    </>
  )
}


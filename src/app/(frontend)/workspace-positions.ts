/**
 * Custom positions for workspace items, keyed by project ID.
 *
 * To generate: open the site, drag items where you want them,
 * then run `dumpPositions()` in the browser console.
 * Paste the `positions` object here under the project's ID.
 */

interface Position {
  x: number
  y: number
  rotate: number
  tx: number
  ty: number
}

export const customPositions: Record<number, Record<string, Position>> = {
  // Breaking the Deadlock
  1: {
    credits: { x: 50, y: 50, rotate: 0, tx: 192, ty: -282 },
    desc: { x: 50, y: 50, rotate: 0, tx: 308, ty: 235 },
    'img-1': { x: 50, y: 50, rotate: 0, tx: -284, ty: 147 },
    'img-2': { x: 50, y: 50, rotate: 0, tx: 268, ty: -52 },
    'img-3': { x: 50, y: 50, rotate: 0, tx: -280, ty: -174 },
  },
  // A Trip to Infinity
  2: {
    credits: { x: 50, y: 50, rotate: 0, tx: -286, ty: 328 },
    desc: { x: 50, y: 50, rotate: 0, tx: 318, ty: 90 },
    'img-4': { x: 50, y: 50, rotate: 0, tx: -262, ty: 115 },
    'img-5': { x: 50, y: 50, rotate: 0, tx: 271, ty: -187 },
    'img-6': { x: 50, y: 50, rotate: 0, tx: -266, ty: -175 },
  },
  // Dr. Tony Fauci
  3: {
    credits: { x: 50, y: 50, rotate: 0, tx: 158, ty: 381 },
    desc: { x: 50, y: 50, rotate: 0, tx: 299, ty: -114 },
    'img-18': { x: 50, y: 50, rotate: 0, tx: -284, ty: 182 },
    'img-17': { x: 50, y: 50, rotate: 0, tx: 251, ty: 154 },
    'img-16': { x: 50, y: 50, rotate: 0, tx: -291, ty: -140 },
    emmy: { x: 50, y: 50, rotate: 0, tx: 611, ty: 209 },
  },
}

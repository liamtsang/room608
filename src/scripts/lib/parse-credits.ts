/**
 * Parse Room 608 credit text into structured { role, name } pairs.
 *
 * On the live site, credits appear in several shapes:
 *   - inline:            "Director MARK MANNUCCI"
 *   - role-then-names:   "Directors\nJONATHAN HALPERIN\nDREW TAKAHASHI"
 *   - compound roles:    "Director/Writer JONATHAN HALPERIN"
 *                        "Directors, Writers & Executive Producers JON & MARK"
 *   - merged on one line: "Producers JON & MARK Executive Producers ANDREW LACK"
 *
 * Names are ALL-CAPS; roles are Title Case; trailing production-company /
 * footage lines are mixed-case and are returned as `leftover` (not credits).
 */

export interface Credit {
  role: string
  name: string
}

export interface CreditParseResult {
  credits: Credit[]
  leftover: string[]
  warnings: string[]
}

// Role keywords, MOST-SPECIFIC FIRST (alternation order decides overlapping
// matches, e.g. "Executive Producer" must beat "Producer", "Director of
// Photography" must beat "Director"). Trailing "s?" handles plurals. Includes
// the "<verb> by" grammar ("Produced by NAME", "Animation by NAME").
const ROLE_KEYWORDS = [
  // "<verb> by" forms (resolved to a canonical role by resolveRole)
  'Conceived and Produced by',
  'Co-Executive Produced by',
  'Executive Produced by',
  'Produced by',
  'Co-Directed by',
  'Directed by',
  'Co-Written by',
  'Written by',
  'Edited by',
  'Animated by',
  'Animation by',
  'Original Music by',
  'Music Composed by',
  'Music by',
  'Score by',
  'Cinematography by',
  'Photographed by',
  'Photography by',
  'Narrated by',
  'Created by',
  // bare past-participle forms ("Produced & Written by NAME")
  'Co-Directed',
  'Co-Written',
  'Produced',
  'Directed',
  'Written',
  'Edited',
  'Animated',
  'Photographed',
  'Narrated',
  // noun forms
  'Co-Executive Producers?',
  'Executive Producers?',
  'Supervising Producers?',
  'Senior Producers?',
  'Associate Producers?',
  'Co-Producers?',
  'Line Producers?',
  'Producers?',
  'Co-Directors?',
  'Directors? of Photography',
  'Directors?',
  'Co-Writers?',
  'Writers?',
  'Editors?',
  'Cinematographers?',
  'Composers?',
  'Animators?',
  'Animation',
  'Narrators?',
  'Hosts?',
  'Camera',
  'Cinematography',
  'Photography',
  'Music',
]

// "<verb> by" → canonical role.
const ROLE_ALIASES: [RegExp, string][] = [
  [/^conceived and produced by$/i, 'Producer'],
  [/^(co-executive|executive) produced by$/i, 'Executive Producer'],
  [/^produced by$/i, 'Producer'],
  [/^co-directed by$/i, 'Co-Director'],
  [/^directed by$/i, 'Director'],
  [/^co-written by$/i, 'Co-Writer'],
  [/^written by$/i, 'Writer'],
  [/^edited by$/i, 'Editor'],
  [/^(animated|animation) by$/i, 'Animator'],
  [/^(original music|music composed|music|score) by$/i, 'Music'],
  [/^(cinematography|photographed|photography) by$/i, 'Cinematographer'],
  [/^narrated by$/i, 'Narrator'],
  [/^created by$/i, 'Creator'],
  // bare forms
  [/^produced$/i, 'Producer'],
  [/^co-directed$/i, 'Co-Director'],
  [/^directed$/i, 'Director'],
  [/^co-written$/i, 'Co-Writer'],
  [/^written$/i, 'Writer'],
  [/^edited$/i, 'Editor'],
  [/^(animated|animation)$/i, 'Animator'],
  [/^photographed$/i, 'Cinematographer'],
  [/^(cinematography|photography)$/i, 'Cinematographer'],
]

const ROLE_SOURCE = ROLE_KEYWORDS.join('|')
// Global, case-insensitive scan for every role keyword occurrence in a line.
const ROLE_SCAN = new RegExp(`\\b(?:${ROLE_SOURCE})\\b`, 'gi')
// Anchored test: does a line START with a role keyword?
const ROLE_START = new RegExp(`^\\s*(?:${ROLE_SOURCE})\\b`, 'i')

/** Resolve a matched role keyword to its canonical singular Title-Case form. */
function resolveRole(matched: string): string {
  for (const [re, canonical] of ROLE_ALIASES) {
    if (re.test(matched.trim())) return canonical
  }
  return singularizeRole(matched)
}

/** Name particles kept lowercase when title-casing. */
const PARTICLES = new Set(['de', 'la', 'le', 'van', 'von', 'der', 'den', 'di', 'da', 'du', 'del'])
/** Override map for names that don't title-case cleanly. Extend as needed. */
const NAME_EXCEPTIONS: Record<string, string> = {}

function letterStats(s: string): { upper: number; lower: number } {
  let upper = 0
  let lower = 0
  for (const ch of s) {
    if (ch >= 'A' && ch <= 'Z') upper++
    else if (ch >= 'a' && ch <= 'z') lower++
  }
  return { upper, lower }
}

/** True when a string is predominantly uppercase (i.e. a NAME line/segment). */
export function isMostlyUpper(s: string): boolean {
  const { upper, lower } = letterStats(s)
  if (upper === 0) return false
  return upper / (upper + lower) >= 0.7
}

/** True when a string contains a 2+ uppercase-letter word (a likely name). */
export function hasUpperWord(s: string): boolean {
  return /[A-Z][A-Z][A-Z]*/.test(s) || /[A-Z]\.[A-Z]/.test(s)
}

export function startsWithRole(line: string): boolean {
  return ROLE_START.test(line)
}

/**
 * Is this line part of the credits block (vs. synopsis prose or attribution)?
 * True when the line is a pure NAME line, OR contains role keyword(s) and, once
 * the roles + name words + connectors are removed, nothing prose-like remains.
 * This catches role-only lines ("Writer / Executive Producer"), compound lines
 * ("Directors, Writers & Executive Producers") and "<verb> by NAME" lines,
 * while rejecting prose sentences that merely contain a role word.
 */
export function isCreditLine(line: string): boolean {
  if (isMostlyUpper(line) && hasUpperWord(line)) return true
  const matches = findRoleMatches(line)
  if (matches.length === 0) return false
  // strip role spans
  let rest = ''
  let cursor = 0
  for (const m of matches) {
    rest += line.slice(cursor, m.start)
    cursor = m.end
  }
  rest += line.slice(cursor)
  // remove uppercase name words + connectors/stopwords; what's left should be empty
  const residue = rest
    .replace(/[A-Z][A-Z.'’&-]+/g, ' ')
    .replace(/\b(and|by|for|with|the|of|a|an)\b/gi, ' ')
    .replace(/[\s,&/©–—.-]+/g, ' ')
    .trim()
  return residue.length === 0
}

/** Title-case an ALL-CAPS name, preserving particles, Mc/Mac, O', hyphens. */
export function titleCaseName(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  const key = trimmed.toUpperCase()
  if (NAME_EXCEPTIONS[key]) return NAME_EXCEPTIONS[key]

  const capWord = (w: string): string => {
    if (!w) return w
    // hyphenated parts (Smith-Jones) and apostrophe parts (O'Brien)
    if (w.includes('-')) return w.split('-').map(capWord).join('-')
    const lower = w.toLowerCase()
    if (lower.startsWith("o'") && lower.length > 2) return "O'" + capWord(w.slice(2))
    if (lower.startsWith('mc') && lower.length > 2) return 'Mc' + capWord(w.slice(2))
    if (lower.startsWith('mac') && lower.length > 3) return 'Mac' + capWord(w.slice(3))
    // initials like "J." -> "J."
    if (/^[A-Za-z]\.$/.test(w)) return w.toUpperCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  return trimmed
    .split(' ')
    .map((word, i) => {
      const lower = word.toLowerCase()
      // keep particles lowercase, but never as the first word
      if (i > 0 && PARTICLES.has(lower)) return lower
      return capWord(word)
    })
    .join(' ')
}

/** Normalize a role keyword to canonical singular Title Case. */
export function singularizeRole(role: string): string {
  let r = role.trim().replace(/\s+/g, ' ')
  // Title-case each word for consistent output (source is usually already so)
  r = r
    .split(' ')
    .map((w) =>
      w.includes('-')
        ? w
            .split('-')
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
            .join('-')
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(' ')
  // Singularize the final word unless it ends in "ss" or is "Photography" etc.
  const words = r.split(' ')
  const last = words[words.length - 1]
  if (/s$/.test(last) && !/ss$/.test(last) && last.toLowerCase() !== 'photography') {
    words[words.length - 1] = last.replace(/s$/, '')
  }
  return words.join(' ')
}

/** Split a NAME segment into individual title-cased names. */
export function splitNames(text: string): string[] {
  return text
    .replace(/^[\s,&/]+|[\s,&/]+$/g, '')
    .split(/\s*&\s*|\s*,\s*|\s+and\s+/i)
    .map((n) => titleCaseName(n))
    .filter((n) => n.length > 0)
}

interface RoleMatch {
  role: string
  start: number
  end: number
}

function findRoleMatches(line: string): RoleMatch[] {
  const matches: RoleMatch[] = []
  ROLE_SCAN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ROLE_SCAN.exec(line)) !== null) {
    matches.push({ role: m[0], start: m.index, end: m.index + m[0].length })
    if (m.index === ROLE_SCAN.lastIndex) ROLE_SCAN.lastIndex++ // avoid zero-width loop
  }
  return matches
}

/**
 * Parse a block of credit lines into structured credits.
 * Lines that are neither role lines nor name lines are returned as `leftover`
 * (production-company / footage attribution).
 */
export function parseCreditBlock(lines: string[]): CreditParseResult {
  const credits: Credit[] = []
  const leftover: string[] = []
  const warnings: string[] = []
  const seen = new Set<string>()

  // roles awaiting names on following lines
  let pendingRoles: string[] = []

  const emit = (roles: string[], namesText: string) => {
    const names = splitNames(namesText)
    if (names.length === 0) return
    const canonical = roles.map(resolveRole)
    if (canonical.length > 1)
      warnings.push(`compound role ${canonical.join('+')} -> ${names.length} name(s)`)
    for (const role of canonical) {
      for (const name of names) {
        const key = `${role}::${name}`
        if (seen.has(key)) continue
        seen.add(key)
        credits.push({ role, name })
      }
    }
  }

  for (const line of lines) {
    const matches = findRoleMatches(line)

    if (matches.length === 0) {
      // No role keyword on this line.
      if (isMostlyUpper(line) && hasUpperWord(line) && pendingRoles.length > 0) {
        emit(pendingRoles, line) // continuation names for the pending role(s)
        // keep pendingRoles active: more name lines may follow
      } else {
        leftover.push(line)
        pendingRoles = []
      }
      continue
    }

    // One or more role keywords on this line. Accumulate consecutive roles that
    // have no names between them, then apply them all to the next name segment.
    let accumulated: string[] = []
    for (let i = 0; i < matches.length; i++) {
      accumulated.push(matches[i].role)
      const gapStart = matches[i].end
      const gapEnd = i + 1 < matches.length ? matches[i + 1].start : line.length
      const gap = line.slice(gapStart, gapEnd)
      if (hasUpperWord(gap)) {
        emit(accumulated, gap)
        accumulated = []
      }
    }
    // Roles left without inline names → expect names on following lines.
    pendingRoles = accumulated
  }

  return { credits, leftover, warnings }
}

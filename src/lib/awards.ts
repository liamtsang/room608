/**
 * Award type options, shared between the Projects collection `awards.type`
 * select and the frontend (which needs to render human labels from the stored
 * value). Single source of truth so the two never drift.
 */
export const AWARD_OPTIONS = [
  { label: 'News & Documentary Emmy® Award', value: 'news-documentary-emmy' },
  { label: 'Primetime Emmy® Award', value: 'primetime-emmy' },
  { label: 'Emmy® Nomination', value: 'emmy-nomination' },
  { label: 'Television Academy Honors Award', value: 'television-academy-honors' },
  { label: 'Wildscreen Award', value: 'wildscreen-award' },
  { label: 'Jackson Wildlife Award', value: 'jackson-wildlife' },
  { label: 'Daytime Entertainment Emmy® Award', value: 'daytime-emmy' },
  { label: 'Peabody Award', value: 'peabody' },
  { label: 'Webby Nomination', value: 'webby-nomination' },
  { label: 'SXSW Audience Award', value: 'sxsw-audience' },
  { label: 'BANFF Award', value: 'banff' },
  { label: 'New York Emmy® Award', value: 'new-york-emmy' },
  { label: 'Gold Hugo Award', value: 'gold-hugo' },
  { label: 'Wildscreen Panda Award', value: 'wildscreen-panda' },
] as const

const AWARD_LABELS: Record<string, string> = Object.fromEntries(
  AWARD_OPTIONS.map((o) => [o.value, o.label]),
)

/** Human label for a stored award value, falling back to the raw value. */
export function awardLabel(value: string): string {
  return AWARD_LABELS[value] ?? value
}

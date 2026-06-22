/**
 * Build a Lexical richText value from plain synopsis paragraphs.
 *
 * Shape matches what Payload's lexical editor stores in this project's DB
 * (see room608-backup.sql, projects.description): root > paragraph > text,
 * every node carrying version:1 and the textFormat/textStyle fields.
 */

export interface LexicalTextNode {
  detail: number
  format: number
  mode: string
  style: string
  text: string
  type: 'text'
  version: number
}

export interface LexicalParagraphNode {
  children: LexicalTextNode[]
  direction: null
  format: string
  indent: number
  type: 'paragraph'
  version: number
  textFormat: number
  textStyle: string
}

export interface LexicalRoot {
  root: {
    children: LexicalParagraphNode[]
    direction: null
    format: string
    indent: number
    type: 'root'
    version: number
  }
}

function textNode(text: string): LexicalTextNode {
  return { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }
}

function paragraph(text: string): LexicalParagraphNode {
  return {
    children: text ? [textNode(text)] : [],
    direction: null,
    format: '',
    indent: 0,
    type: 'paragraph',
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

/** Build a Lexical root from synopsis paragraphs. Empty input → null (no description). */
export function buildDescription(paragraphs: string[]): LexicalRoot | null {
  const cleaned = (paragraphs || []).map((p) => p.trim()).filter((p) => p.length > 0)
  if (cleaned.length === 0) return null
  return {
    root: {
      children: cleaned.map(paragraph),
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

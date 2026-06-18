import type { DocumentKind } from '@/entities/project'

const RULES: Array<[RegExp, DocumentKind]> = [
  [/brd|requirement|요구사항|운영|기획/i, 'brd'],
  [/sales|영업|미팅|memo|note|메모/i, 'sales_note'],
  [/email|mail|메일|gmail|outlook/i, 'email'],
  [/call|통화|stt|transcript|녹취/i, 'call'],
]

export function inferKind(filename: string): DocumentKind {
  const name = filename.toLowerCase()
  for (const [re, kind] of RULES) {
    if (re.test(name)) return kind
  }
  return 'other'
}

export function stripExtension(filename: string): string {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

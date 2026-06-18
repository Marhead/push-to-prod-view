import type { DocumentKind } from '@/entities/project'
import { inferKind, stripExtension } from './infer-kind'

export interface DocumentDraft {
  kind: DocumentKind
  title: string
  content: string
}

export interface SkippedFile {
  name: string
  reason: string
}

export interface ReadFilesResult {
  drafts: DocumentDraft[]
  skipped: SkippedFile[]
}

const ALLOWED_EXT = new Set([
  'txt',
  'md',
  'markdown',
  'json',
  'csv',
  'tsv',
  'log',
  'html',
  'htm',
  'xml',
  'yaml',
  'yml',
  'eml',
  'srt',
  'vtt',
])

const MAX_BYTES = 5 * 1024 * 1024

const extOf = (name: string) => {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}

const isProbablyText = (file: File): boolean => {
  if (file.type.startsWith('text/')) return true
  if (file.type === 'application/json' || file.type === 'application/xml') return true
  return ALLOWED_EXT.has(extOf(file.name))
}

export async function readFilesToDocuments(files: File[]): Promise<ReadFilesResult> {
  const drafts: DocumentDraft[] = []
  const skipped: SkippedFile[] = []

  for (const file of files) {
    if (file.size === 0) {
      skipped.push({ name: file.name, reason: '빈 파일' })
      continue
    }
    if (file.size > MAX_BYTES) {
      skipped.push({ name: file.name, reason: `5MB 초과 (${formatBytes(file.size)})` })
      continue
    }
    if (!isProbablyText(file)) {
      skipped.push({
        name: file.name,
        reason: '지원되지 않는 형식 (텍스트 파일만 가능)',
      })
      continue
    }

    try {
      const content = await file.text()
      if (!content.trim()) {
        skipped.push({ name: file.name, reason: '내용이 비어있습니다' })
        continue
      }
      drafts.push({
        kind: inferKind(file.name),
        title: stripExtension(file.name),
        content,
      })
    } catch (err) {
      skipped.push({
        name: file.name,
        reason: err instanceof Error ? err.message : '읽기 실패',
      })
    }
  }

  return { drafts, skipped }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

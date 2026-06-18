export type ContentTag = 'email' | 'call' | 'chat' | 'other'

const PATTERNS: Array<[RegExp, ContentTag]> = [
  [/^\s*(from|to)\s*:/im, 'email'],
  [/\bSTT\b/i, 'call'],
  [/슬랙|Slack|\bDM\b/i, 'chat'],
]

export function inferContentTag(content: string): ContentTag {
  if (!content) return 'other'
  for (const [re, tag] of PATTERNS) {
    if (re.test(content)) return tag
  }
  return 'other'
}

export const TAG_LABEL: Record<ContentTag, string> = {
  email: '메일',
  call: '통화',
  chat: '채팅',
  other: 'OTHER',
}

export const TAG_CLASS: Record<ContentTag, string> = {
  email: 'border-sky-300 bg-sky-50 text-sky-700',
  call: 'border-amber-300 bg-amber-50 text-amber-700',
  chat: 'border-violet-300 bg-violet-50 text-violet-700',
  other: 'border-slate-300 bg-slate-50 text-slate-600',
}

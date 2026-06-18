export type IndustryId = 'distribution'

export interface IndustryOption {
  id: IndustryId
  label: string
  description: string
}

export const INDUSTRIES: IndustryOption[] = [
  {
    id: 'distribution',
    label: '유통 · 공급망',
    description: 'TPC-H 레퍼런스 (MVP 고정)',
  },
]

export const DEFAULT_INDUSTRY: IndustryId = 'distribution'

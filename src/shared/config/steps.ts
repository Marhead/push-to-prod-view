export type StepId = 'input' | 'brd' | 'seed' | 'ontology' | 'db' | 'align' | 'final'

export interface StepMeta {
  id: StepId
  index: number
  path: string
  label: string
  shortLabel: string
}

export const STEPS: StepMeta[] = [
  { id: 'input', index: 1, path: '/', label: 'S1 · Input', shortLabel: '입력' },
  { id: 'brd', index: 2, path: '/brd', label: 'S2 · BRD Review', shortLabel: 'BRD' },
  { id: 'seed', index: 3, path: '/seed', label: 'S3 · Question + Seed', shortLabel: '질문' },
  { id: 'ontology', index: 4, path: '/graph/ontology', label: 'S4 · Ontology Graph', shortLabel: '온톨로지' },
  { id: 'db', index: 5, path: '/db', label: 'S5 · DB Input', shortLabel: 'DB' },
  { id: 'align', index: 6, path: '/align', label: 'S6 · Alignment', shortLabel: '얼라인' },
  { id: 'final', index: 7, path: '/graph/final', label: 'S7 · Final + Export', shortLabel: '내보내기' },
]

export const STEP_BY_ID: Record<StepId, StepMeta> = STEPS.reduce(
  (acc, step) => {
    acc[step.id] = step
    return acc
  },
  {} as Record<StepId, StepMeta>,
)

export const STEP_BY_PATH: Record<string, StepMeta> = STEPS.reduce(
  (acc, step) => {
    acc[step.path] = step
    return acc
  },
  {} as Record<string, StepMeta>,
)

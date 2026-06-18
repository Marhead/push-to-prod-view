export type StepId = 'input' | 'brd' | 'seed' | 'result'

export interface StepMeta {
  id: StepId
  index: number
  path: string
  label: string
  shortLabel: string
}

export const STEPS: StepMeta[] = [
  { id: 'input', index: 1, path: '/projects/new', label: 'S1 · 입력', shortLabel: '입력' },
  { id: 'brd', index: 2, path: '/brd', label: 'S2 · BRD Review', shortLabel: 'BRD' },
  { id: 'seed', index: 3, path: '/seed', label: 'S3 · 생성', shortLabel: '생성' },
  { id: 'result', index: 4, path: '/result', label: 'S4 · 결과', shortLabel: '결과' },
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

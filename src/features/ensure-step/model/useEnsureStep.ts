import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/entities/project'

export type StepRequirement = 'rawData' | 'brd' | 'questions' | 'ontology'

const REDIRECTS: Record<StepRequirement, string> = {
  rawData: '/projects/new',
  brd: '/brd',
  questions: '/seed',
  ontology: '/graph/ontology',
}

const isEmpty = (value: unknown): boolean => {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}

export function useEnsureStep(requires: StepRequirement[]) {
  const navigate = useNavigate()
  const rawData = useProjectStore((s) => s.rawData)
  const brd = useProjectStore((s) => s.brd)
  const questions = useProjectStore((s) => s.questions)
  const ontology = useProjectStore((s) => s.ontology)

  useEffect(() => {
    const lookup: Record<StepRequirement, unknown> = {
      rawData,
      brd,
      questions,
      ontology,
    }
    for (const req of requires) {
      if (isEmpty(lookup[req])) {
        navigate(REDIRECTS[req], { replace: true })
        return
      }
    }
  }, [requires, navigate, rawData, brd, questions, ontology])
}

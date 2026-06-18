import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/entities/project'

export type StepRequirement = 'rawData'

const REDIRECTS: Record<StepRequirement, string> = {
  rawData: '/projects/new',
}

const isEmpty = (value: unknown): boolean => {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function useEnsureStep(requires: StepRequirement[]) {
  const navigate = useNavigate()
  const rawData = useProjectStore((s) => s.rawData)

  useEffect(() => {
    const lookup: Record<StepRequirement, unknown> = { rawData }
    for (const req of requires) {
      if (isEmpty(lookup[req])) {
        navigate(REDIRECTS[req], { replace: true })
        return
      }
    }
  }, [requires, navigate, rawData])
}

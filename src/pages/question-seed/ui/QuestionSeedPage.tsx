import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Loader2, Radio } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Badge } from '@/shared/ui/badge'
import { StepHeader } from '@/widgets/step-header'
import { useEnsureStep } from '@/features/ensure-step'
import { useProjectListStore } from '@/entities/project'
import { cn } from '@/shared/lib/utils'

interface Stage {
  id: string
  label: string
  detail: string
  durationMs: number
}

const STAGES: Stage[] = [
  { id: 'intake', label: 'intake', detail: '문서 정규화 · 근거 매핑', durationMs: 1600 },
  { id: 'retrieve', label: 'retrieve', detail: '레퍼런스 스키마 + 갭 분석', durationMs: 1500 },
  { id: 'gen_questions', label: 'gen_questions', detail: '비즈니스 질문 생성 (tool-calling)', durationMs: 2200 },
  { id: 'gen_ontology', label: 'gen_ontology', detail: '온톨로지 매핑 · 노드 링크', durationMs: 1800 },
  { id: 'assemble_export', label: 'assemble_export', detail: '결과 조립 · 마크다운 렌더', durationMs: 1100 },
]

const TOTAL_MS = STAGES.reduce((s, x) => s + x.durationMs, 0)

export function QuestionSeedPage() {
  useEnsureStep(['rawData'])
  const navigate = useNavigate()
  const activeProjectId = useProjectListStore((s) => s.activeProjectId)
  const updateProject = useProjectListStore((s) => s.updateProject)

  const [completed, setCompleted] = useState<boolean[]>(() => STAGES.map(() => false))
  const [elapsedMs, setElapsedMs] = useState(0)

  const currentStageIndex = useMemo(() => {
    const idx = completed.findIndex((c) => !c)
    return idx === -1 ? STAGES.length : idx
  }, [completed])

  const progressPct = useMemo(
    () => Math.min(100, Math.round((elapsedMs / TOTAL_MS) * 100)),
    [elapsedMs],
  )

  useEffect(() => {
    let cancelled = false
    const timers: number[] = []
    let acc = 0

    STAGES.forEach((stage, idx) => {
      acc += stage.durationMs
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return
          setCompleted((prev) => prev.map((v, i) => (i === idx ? true : v)))
        }, acc),
      )
    })

    const ticker = window.setInterval(() => {
      if (cancelled) return
      setElapsedMs((prev) => Math.min(TOTAL_MS, prev + 50))
    }, 50)

    timers.push(
      window.setTimeout(() => {
        if (cancelled) return
        if (activeProjectId) {
          updateProject(activeProjectId, { step: 'result' })
          navigate(`/${activeProjectId}`, { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }, acc + 350),
    )

    return () => {
      cancelled = true
      window.clearInterval(ticker)
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [activeProjectId, navigate, updateProject])

  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="seed"
        title="S3 · 생성"
        description="LangGraph 파이프라인이 실행되는 동안 진행 상태를 표시합니다."
      />

      <main className="container mx-auto flex flex-col items-center px-6 py-10">
        <Card className="w-full max-w-2xl shadow-md">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Domain Pack 생성 중</CardTitle>
              <CardDescription>완료되면 결과 페이지로 자동 이동합니다.</CardDescription>
            </div>
            <SseIndicator />
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Progress value={progressPct} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {Math.min(currentStageIndex + 1, STAGES.length)} / {STAGES.length} 단계
                </span>
                <span className="font-mono">{progressPct}%</span>
              </div>
            </div>

            <ol className="flex flex-col gap-2">
              {STAGES.map((stage, idx) => {
                const done = completed[idx]
                const active = idx === currentStageIndex && !done
                return (
                  <li
                    key={stage.id}
                    className={cn(
                      'flex items-start gap-3 rounded-md border px-3 py-2 transition-colors',
                      done && 'border-emerald-200 bg-emerald-50/60',
                      active && 'border-primary bg-primary/5',
                      !done && !active && 'border-muted bg-card',
                    )}
                  >
                    <StageIcon done={done} active={active} />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{stage.label}</span>
                        {done ? (
                          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700">
                            완료
                          </Badge>
                        ) : active ? (
                          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                            진행 중
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">{stage.detail}</span>
                    </div>
                  </li>
                )
              })}
            </ol>

            <p className="text-center text-xs text-muted-foreground">
              SSE 스트리밍 시뮬레이션 — 실제 백엔드 연동은 추후 작업.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function StageIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) return <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden />
  if (active) return <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-primary" aria-hidden />
  return <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
}

function SseIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <Radio className="h-3 w-3 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">SSE 연결됨</span>
    </div>
  )
}

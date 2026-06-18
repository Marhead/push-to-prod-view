import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ClipboardCopy,
  Database,
  FileText,
  Layers,
  PlayCircle,
  RefreshCw,
  Workflow,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

import { OntologyGraph } from '@/features/graph-view'
import { useProjectListStore, useProjectStore } from '@/entities/project'
import { DEFAULT_INDUSTRY, INDUSTRY_LABEL, type IndustryId } from '@/shared/config/industry'
import { cn } from '@/shared/lib/utils'
import { buildMockResult } from '../lib/mock-result'

const formatDate = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function ResultPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()

  const projects = useProjectListStore((s) => s.projects)
  const activeProjectId = useProjectListStore((s) => s.activeProjectId)
  const setActiveProjectId = useProjectListStore((s) => s.setActiveProjectId)
  const ensureSeed = useProjectListStore((s) => s.ensureSeed)

  useEffect(() => {
    ensureSeed()
  }, [ensureSeed])

  const project = useMemo(
    () => (projectId ? projects.find((p) => p.id === projectId) ?? null : null),
    [projectId, projects],
  )

  useEffect(() => {
    if (project && activeProjectId !== project.id) {
      setActiveProjectId(project.id)
    }
  }, [project, activeProjectId, setActiveProjectId])

  const storedIndustry = useProjectStore((s) => s.industry)
  const rawData = useProjectStore((s) => s.rawData)

  const industry: IndustryId = project?.industry ?? storedIndustry ?? DEFAULT_INDUSTRY
  const projectName = project?.name ?? `프로젝트 ${(projectId ?? '').slice(0, 8) || 'mock'}`

  const result = useMemo(
    () => buildMockResult(industry, projectName, projectId ?? 'mock'),
    [industry, projectName, projectId],
  )

  const [exportOpen, setExportOpen] = useState(false)
  const [copying, setCopying] = useState(false)

  const copyMarkdown = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(result.export_markdown)
      toast.success('마크다운 복사됨')
    } catch {
      toast.error('복사 실패')
    } finally {
      setCopying(false)
    }
  }

  const regenerate = () => navigate('/seed')

  if (!projectId) {
    return <Navigate to="/" replace />
  }

  const industryLabel = INDUSTRY_LABEL[industry] ?? industry
  const docCount = rawData.length > 0 ? rawData.length : project?.documentCount ?? 0

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <aside className="flex w-72 shrink-0 flex-col border-r bg-background">
        <div className="border-b px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="-ml-2 mb-2 gap-1 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> 프로젝트 목록
          </Button>
          <h1 className="text-base font-semibold leading-tight">{projectName}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{industryLabel}</Badge>
            <span aria-hidden>·</span>
            <span>{docCount}개 문서</span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            <Section title="메타데이터">
              <MetaRow label="ID" value={projectId} mono />
              <MetaRow label="산업" value={industryLabel} />
              <MetaRow label="문서" value={`${docCount}개`} />
              {project ? (
                <>
                  <MetaRow label="생성" value={formatDate(project.createdAt)} />
                  <MetaRow label="수정" value={formatDate(project.updatedAt)} />
                </>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  알 수 없는 프로젝트 — 임시 슬롯에서 mock 데이터로 표시 중
                </p>
              )}
            </Section>

            {rawData.length > 0 ? (
              <Section title="입력 문서" count={rawData.length}>
                {rawData.slice(0, 5).map((d) => (
                  <div key={d.id} className="rounded-md border bg-card px-2 py-1.5">
                    <p className="truncate text-xs font-medium">{d.title}</p>
                    <p className="font-mono text-[10px] uppercase text-muted-foreground">{d.kind}</p>
                  </div>
                ))}
                {rawData.length > 5 ? (
                  <p className="text-[10px] text-muted-foreground">
                    +{rawData.length - 5}개 더보기
                  </p>
                ) : null}
              </Section>
            ) : null}

            <Section title="워크플로우" count={result.workflows.length}>
              {result.workflows.map((wf) => (
                <div key={wf.id} className="rounded-md border bg-card px-2 py-1.5">
                  <p className="truncate text-xs font-medium">{wf.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {wf.id} → {wf.answers_question}
                  </p>
                </div>
              ))}
            </Section>

            <Section title="데모 시나리오">
              <p className="line-clamp-3 text-xs text-muted-foreground">
                {result.demo_scenario.narrative}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                기반: {result.demo_scenario.based_on}
              </p>
            </Section>

            <Section title="필요 데이터">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-medium text-emerald-700">확보 ({result.required_sources.available.length})</span>
                <div className="flex flex-wrap gap-1">
                  {result.required_sources.available.slice(0, 4).map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="border-emerald-300 bg-emerald-50 font-mono text-[9px] text-emerald-700"
                    >
                      {s}
                    </Badge>
                  ))}
                  {result.required_sources.available.length > 4 ? (
                    <span className="text-[10px] text-muted-foreground">
                      +{result.required_sources.available.length - 4}
                    </span>
                  ) : null}
                </div>
                <span className="mt-1 text-[10px] font-medium text-amber-700">필요 ({result.required_sources.needed.length})</span>
                <div className="flex flex-col gap-1">
                  {result.required_sources.needed.map((s) => (
                    <span key={s} className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </ScrollArea>

        <div className="flex gap-2 border-t p-3">
          <Button size="sm" variant="outline" onClick={regenerate} className="flex-1 gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> 재생성
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)} className="flex-1 gap-1">
            <ClipboardCopy className="h-3.5 w-3.5" /> 내보내기
          </Button>
        </div>
      </aside>

      <main className="relative flex-1 overflow-hidden bg-muted/30">
        <div className="absolute inset-0">
          <OntologyGraph ontology={result.ontology} direction="LR" height="100%" />
        </div>
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-md border bg-background/90 px-2.5 py-1.5 shadow-sm backdrop-blur">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <span className="text-xs font-medium">온톨로지</span>
          <Badge variant="outline" className="px-1.5 text-[10px]">
            노드 {result.ontology.nodes.length}
          </Badge>
          <Badge variant="outline" className="px-1.5 text-[10px]">
            관계 {result.ontology.relations.length}
          </Badge>
        </div>
      </main>

      <aside className="flex w-96 shrink-0 flex-col border-l bg-background">
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">비즈니스 질문</h2>
            <Badge variant="outline" className="px-1.5 text-[10px]">
              {result.business_questions.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">생성된 질문과 데이터 바인딩</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 p-4">
            {result.business_questions.map((q) => {
              const missing = q.data_status.startsWith('missing')
              return (
                <div
                  key={q.id}
                  className="rounded-md border border-l-4 border-l-primary/60 bg-card px-3 py-2 shadow-sm"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{q.id}</Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        missing
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-700',
                      )}
                    >
                      {missing ? q.data_status : 'available'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug">{q.question}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {q.category} · {q.rationale}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {q.linked_sources.map((src) => (
                      <Tooltip key={src}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-default font-mono text-[10px]"
                          >
                            {src}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{src}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </aside>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> PoC 셋업 체크리스트
            </DialogTitle>
            <DialogDescription>
              생성된 마크다운을 복사해 Notion / Slack / GitHub Issue에 붙여 넣으세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={copyMarkdown} disabled={copying} className="gap-1">
              <ClipboardCopy className="h-3.5 w-3.5" />
              {copying ? '복사 중...' : '복사'}
            </Button>
          </div>
          <ScrollArea className="h-[60vh] w-full rounded-md border bg-muted/30">
            <pre className="whitespace-pre-wrap px-4 py-3 font-mono text-xs leading-relaxed">
              {result.export_markdown}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {typeof count === 'number' ? (
          <Badge variant="outline" className="px-1 py-0 text-[9px]">
            {count}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  )
}

function MetaRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span
        className={cn(
          'truncate text-right text-xs font-medium',
          mono && 'font-mono text-[10px] text-muted-foreground',
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  )
}

// satisfy unused-import linter when icons used conditionally
void Database
void PlayCircle
void Workflow

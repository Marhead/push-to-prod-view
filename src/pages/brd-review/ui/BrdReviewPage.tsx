import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { StepHeader } from '@/widgets/step-header'
import { useEnsureStep } from '@/features/ensure-step'
import { useProjectStore } from '@/entities/project'
import { INDUSTRY_LABEL } from '@/shared/config/industry'
import { cn } from '@/shared/lib/utils'
import { inferContentTag, TAG_CLASS, TAG_LABEL, type ContentTag } from '../lib/infer-content-tag'

export function BrdReviewPage() {
  useEnsureStep(['rawData'])
  const navigate = useNavigate()
  const rawData = useProjectStore((s) => s.rawData)
  const industry = useProjectStore((s) => s.industry)

  const tagged = useMemo(
    () => rawData.map((doc) => ({ doc, tag: inferContentTag(doc.content) })),
    [rawData],
  )

  const tagCounts = useMemo(() => {
    const acc: Record<ContentTag, number> = { email: 0, call: 0, chat: 0, other: 0 }
    for (const { tag } of tagged) acc[tag]++
    return acc
  }, [tagged])

  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="brd"
        title="S2 · BRD Review"
        description="업로드된 문서를 본문 내용으로 자동 태깅했습니다. (W-S3에서 ProblemProfile UI로 확장)"
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/')}>이전</Button>
            <Button onClick={() => navigate('/seed')}>다음</Button>
          </>
        }
      />
      <main className="container mx-auto flex flex-col gap-4 px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>입력 요약</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                산업:{' '}
                <span className="font-medium text-foreground">
                  {INDUSTRY_LABEL[industry] ?? industry}
                </span>
              </span>
              <span aria-hidden>·</span>
              <span>문서 {rawData.length}개</span>
              <span aria-hidden>·</span>
              <span className="inline-flex flex-wrap items-center gap-1.5">
                {(['email', 'call', 'chat', 'other'] as ContentTag[])
                  .filter((t) => tagCounts[t] > 0)
                  .map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className={cn('text-[10px]', TAG_CLASS[t])}
                    >
                      {TAG_LABEL[t]} {tagCounts[t]}
                    </Badge>
                  ))}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {tagged.map(({ doc, tag }) => (
              <div key={doc.id} className="rounded-md border bg-card p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn('font-medium', TAG_CLASS[tag])}
                  >
                    {TAG_LABEL[tag]}
                  </Badge>
                  <span className="truncate text-sm font-medium">{doc.title}</span>
                </div>
                <p className="line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                  {doc.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          [TODO W-S3] intake 결과 ProblemProfile UI · 인라인 편집 · EvidenceBadge
        </p>
      </main>
    </div>
  )
}

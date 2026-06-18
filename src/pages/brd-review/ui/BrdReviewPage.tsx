import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { StepHeader } from '@/widgets/step-header'
import { useEnsureStep } from '@/features/ensure-step'
import { useProjectStore } from '@/entities/project'

export function BrdReviewPage() {
  useEnsureStep(['rawData'])
  const navigate = useNavigate()
  const rawData = useProjectStore((s) => s.rawData)
  const industry = useProjectStore((s) => s.industry)

  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="brd"
        title="S2 · BRD Review"
        description="intake 출력(ProblemProfile)을 인라인 편집할 영역입니다. (W-S3에서 실연동)"
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
            <CardDescription>
              산업: <span className="font-mono">{industry}</span> · 문서 {rawData.length}개
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {rawData.map((doc) => (
              <div key={doc.id} className="rounded-md border bg-card p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="outline" className="font-mono uppercase">{doc.kind}</Badge>
                  <span className="text-sm font-medium">{doc.title}</span>
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">{doc.content}</p>
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

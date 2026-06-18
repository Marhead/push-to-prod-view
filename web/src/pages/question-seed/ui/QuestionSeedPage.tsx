import { StepHeader } from '@/widgets/step-header'
import { useEnsureStep } from '@/features/ensure-step'

export function QuestionSeedPage() {
  useEnsureStep(['rawData'])
  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="seed"
        title="S3 · Question + Seed"
        description="review① 라이브 지점 — W-S3에서 구현"
      />
      <main className="container mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">
          [TODO W-S3] 질문 카드 / coverage / review① 3버튼 (승인 / 인라인 수정 / 피드백 재생성)
        </p>
      </main>
    </div>
  )
}

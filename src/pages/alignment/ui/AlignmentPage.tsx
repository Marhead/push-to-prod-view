import { StepHeader } from '@/widgets/step-header'

export function AlignmentPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="align"
        title="S6 · Alignment"
        description="레퍼런스 기반 갭 매칭 — W-S5에서 목업"
      />
      <main className="container mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">[TODO W-S5] 매칭 카드 UI 목업</p>
      </main>
    </div>
  )
}

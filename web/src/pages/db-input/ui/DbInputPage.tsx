import { StepHeader } from '@/widgets/step-header'

export function DbInputPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="db"
        title="S5 · DB Input"
        description="DDL 입력 — W-S5에서 목업"
      />
      <main className="container mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">[TODO W-S5] 정적 트리뷰 목업</p>
      </main>
    </div>
  )
}

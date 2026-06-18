import { StepHeader } from '@/widgets/step-header'

export function GraphFinalPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="final"
        title="S7 · Final + Export"
        description="pack.export.markdown 렌더 — W-S5에서 목업"
      />
      <main className="container mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">
          [TODO W-S5] GraphCanvas(mode='final') + ExportPanel + 마크다운 복사
        </p>
      </main>
    </div>
  )
}

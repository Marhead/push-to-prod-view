import { StepHeader } from '@/widgets/step-header'
import { useEnsureStep } from '@/features/ensure-step'

export function GraphOntologyPage() {
  useEnsureStep(['rawData'])
  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="ontology"
        title="S4 · Ontology Graph"
        description="Cytoscape + cose-bilkent — W-S4에서 구현"
      />
      <main className="container mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">
          [TODO W-S4] GraphCanvas(mode='ontology') / GraphToolbar / NodeDetailPanel
        </p>
      </main>
    </div>
  )
}

import { STEPS, type StepId } from '@/shared/config/steps'

interface StepHeaderProps {
  activeStep: StepId
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function StepHeader({ activeStep, title, description, actions }: StepHeaderProps) {
  const fallback = STEPS.find((s) => s.id === activeStep)?.label ?? ''
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Domain Pack Builder
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{title ?? fallback}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}

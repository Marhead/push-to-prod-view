import { NavLink } from 'react-router-dom'
import { STEPS, type StepId } from '@/shared/config/steps'
import { cn } from '@/shared/lib/utils'

interface StepHeaderProps {
  activeStep: StepId
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function StepHeader({ activeStep, title, description, actions }: StepHeaderProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === activeStep)
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="container mx-auto flex flex-col gap-3 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Domain Pack Builder
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              {title ?? STEPS[activeIndex]?.label ?? ''}
            </h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-xs">
          {STEPS.map((step, i) => {
            const done = i < activeIndex
            const active = i === activeIndex
            return (
              <NavLink
                key={step.id}
                to={step.path}
                className={cn(
                  'rounded-full border px-3 py-1 transition-colors',
                  active && 'border-primary bg-primary text-primary-foreground',
                  done && !active && 'border-muted-foreground/40 text-muted-foreground hover:bg-muted',
                  !done && !active && 'border-muted text-muted-foreground hover:bg-muted',
                )}
              >
                <span className="font-mono">{step.index}.</span> {step.shortLabel}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

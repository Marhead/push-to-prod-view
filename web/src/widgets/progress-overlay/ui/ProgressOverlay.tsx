import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ProgressOverlayProps {
  visible: boolean
  message?: string
  className?: string
}

export function ProgressOverlay({ visible, message, className }: ProgressOverlayProps) {
  if (!visible) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 rounded-lg border bg-card px-6 py-5 shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">{message ?? '진행 중...'}</p>
      </div>
    </div>
  )
}

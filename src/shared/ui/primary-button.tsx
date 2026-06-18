import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button, type ButtonProps } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'

export interface PrimaryButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ loading = false, loadingText, disabled, children, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn('gap-2', className)}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        <span>{loading && loadingText ? loadingText : children}</span>
      </Button>
    )
  },
)
PrimaryButton.displayName = 'PrimaryButton'

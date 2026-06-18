import { AlertCircle, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

interface ErrorBannerProps {
  message?: string | null
  title?: string
  onDismiss?: () => void
}

export function ErrorBanner({ message, title = '문제가 발생했습니다', onDismiss }: ErrorBannerProps) {
  if (!message) return null
  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="pr-8">{message}</AlertDescription>
      {onDismiss ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="absolute right-2 top-2 h-6 w-6 text-destructive hover:text-destructive"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </Alert>
  )
}

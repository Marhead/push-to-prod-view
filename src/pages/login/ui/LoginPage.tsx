import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PrimaryButton } from '@/shared/ui/primary-button'
import { ErrorBanner } from '@/widgets/error-banner'
import { useSessionStore } from '@/entities/session'

const formSchema = z.object({
  username: z.string().min(1, '아이디를 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})

type FormValues = z.infer<typeof formSchema>

interface LocationState {
  from?: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useSessionStore((s) => s.signIn)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      const result = signIn(username.trim(), password)
      if (!result.ok) {
        setSubmitError(result.error ?? '로그인에 실패했습니다.')
        return
      }
      toast.success('환영합니다', { description: `${username} 님으로 로그인되었습니다.` })
      const redirectTo = (location.state as LocationState | null)?.from ?? '/'
      navigate(redirectTo, { replace: true })
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Domain Pack Builder</CardTitle>
          <CardDescription>계정으로 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {submitError ? (
              <ErrorBanner
                title="로그인 실패"
                message={submitError}
                onDismiss={() => setSubmitError(null)}
              />
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                autoComplete="username"
                autoFocus
                placeholder="admin"
                aria-invalid={!!errors.username}
                {...register('username')}
              />
              {errors.username ? (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <PrimaryButton
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
              loadingText="로그인 중..."
            >
              로그인
            </PrimaryButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

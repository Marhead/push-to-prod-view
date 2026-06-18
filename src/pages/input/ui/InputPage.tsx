import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { PrimaryButton } from '@/shared/ui/primary-button'

import { StepHeader } from '@/widgets/step-header'
import { ProgressOverlay } from '@/widgets/progress-overlay'
import { ErrorBanner } from '@/widgets/error-banner'

import { INDUSTRIES, DEFAULT_INDUSTRY, type IndustryId } from '@/shared/config/industry'
import { useProjectStore, useProjectListStore } from '@/entities/project'

const DOC_KINDS = [
  { value: 'brd', label: 'BRD' },
  { value: 'sales_note', label: '영업 메모' },
  { value: 'email', label: '이메일' },
  { value: 'call', label: '통화 기록' },
  { value: 'other', label: '기타' },
] as const

const documentSchema = z.object({
  kind: z.enum(['brd', 'sales_note', 'email', 'call', 'other']),
  title: z.string().min(1, '제목을 입력하세요').max(120),
  content: z.string().min(10, '본문은 최소 10자 이상 입력하세요'),
})

const formSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력하세요').max(80),
  industry: z.enum(['distribution']),
  documents: z.array(documentSchema).min(1, '문서를 1개 이상 추가하세요'),
})

type FormValues = z.infer<typeof formSchema>

const emptyDocument: FormValues['documents'][number] = {
  kind: 'brd',
  title: '',
  content: '',
}

export function InputPage() {
  const navigate = useNavigate()
  const setRawData = useProjectStore((s) => s.setRawData)
  const setIndustry = useProjectStore((s) => s.setIndustry)
  const setLoading = useProjectStore((s) => s.setLoading)
  const setError = useProjectStore((s) => s.setError)
  const persistedIndustry = useProjectStore((s) => s.industry)
  const persistedDocs = useProjectStore((s) => s.rawData)

  const activeProjectId = useProjectListStore((s) => s.activeProjectId)
  const projects = useProjectListStore((s) => s.projects)
  const createProject = useProjectListStore((s) => s.createProject)
  const updateProject = useProjectListStore((s) => s.updateProject)
  const activeProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId) ?? null
    : null

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: activeProject?.name ?? '',
      industry: (persistedIndustry as IndustryId) ?? DEFAULT_INDUSTRY,
      documents:
        persistedDocs.length > 0
          ? persistedDocs.map(({ kind, title, content }) => ({ kind, title, content }))
          : [{ ...emptyDocument }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'documents' })
  const industry = watch('industry')

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    setSubmitting(true)
    setLoading('input', true)
    setError('input', null)
    try {
      setIndustry(values.industry)
      setRawData(
        values.documents.map((doc) => ({
          id: globalThis.crypto?.randomUUID?.() ?? `doc_${Date.now()}_${Math.random()}`,
          ...doc,
        })),
      )

      if (activeProject) {
        updateProject(activeProject.id, {
          name: values.name.trim(),
          industry: values.industry,
          documentCount: values.documents.length,
          step: 'brd',
        })
      } else {
        createProject({
          name: values.name.trim(),
          industry: values.industry,
          documentCount: values.documents.length,
          step: 'brd',
        })
      }

      toast.success('프로젝트가 저장되었습니다', { description: '다음 단계로 이동합니다.' })
      await new Promise((r) => setTimeout(r, 250))
      navigate('/brd')
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      setSubmitError(message)
      setError('input', message)
      toast.error('저장 실패', { description: message })
    } finally {
      setSubmitting(false)
      setLoading('input', false)
    }
  })

  return (
    <div className="min-h-screen bg-muted/40">
      <StepHeader
        activeStep="input"
        title={activeProject ? `S1 · ${activeProject.name}` : 'S1 · 새 프로젝트'}
        description="프로젝트 이름과 산업, 입력 문서를 등록합니다. 입력은 sessionStorage에 자동 저장됩니다."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/')} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            프로젝트 목록
          </Button>
        }
      />

      <main className="container mx-auto flex flex-col gap-6 px-6 py-8">
        {submitError ? (
          <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />
        ) : null}

        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 정보</CardTitle>
              <CardDescription>
                MVP는 유통·공급망(TPC-H) 레퍼런스 스키마에 고정됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">프로젝트 이름</Label>
                <Input
                  id="name"
                  placeholder="예: ABC상사 PoC"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="industry">산업</Label>
                <Select
                  value={industry}
                  onValueChange={(v) => setValue('industry', v as IndustryId, { shouldValidate: true })}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="산업을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>입력 문서</CardTitle>
                <CardDescription>
                  BRD, 영업 메모, 통화 기록 등 텍스트 문서를 등록합니다 (최소 1개).
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ...emptyDocument })}
              >
                <Plus className="mr-1 h-4 w-4" />
                문서 추가
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {fields.length === 0 ? (
                <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  문서가 없습니다. '문서 추가' 버튼으로 시작하세요.
                </p>
              ) : null}

              {fields.map((field, index) => {
                const docErrors = errors.documents?.[index]
                return (
                  <div key={field.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <Badge variant="secondary" className="font-mono">
                        DOC #{index + 1}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label={`문서 ${index + 1} 삭제`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                      <div className="grid gap-2">
                        <Label htmlFor={`doc-${index}-kind`}>종류</Label>
                        <Select
                          value={watch(`documents.${index}.kind`)}
                          onValueChange={(v) =>
                            setValue(
                              `documents.${index}.kind`,
                              v as FormValues['documents'][number]['kind'],
                              { shouldValidate: true },
                            )
                          }
                        >
                          <SelectTrigger id={`doc-${index}-kind`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DOC_KINDS.map((kind) => (
                              <SelectItem key={kind.value} value={kind.value}>
                                {kind.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`doc-${index}-title`}>제목</Label>
                        <Input
                          id={`doc-${index}-title`}
                          placeholder="예: 유통 운영 BRD v1.2"
                          {...register(`documents.${index}.title`)}
                          aria-invalid={!!docErrors?.title}
                        />
                        {docErrors?.title ? (
                          <p className="text-xs text-destructive">{docErrors.title.message}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Label htmlFor={`doc-${index}-content`}>본문</Label>
                      <Textarea
                        id={`doc-${index}-content`}
                        rows={6}
                        placeholder="문서 원문을 붙여넣으세요. 최소 10자."
                        {...register(`documents.${index}.content`)}
                        aria-invalid={!!docErrors?.content}
                      />
                      {docErrors?.content ? (
                        <p className="text-xs text-destructive">{docErrors.content.message}</p>
                      ) : null}
                    </div>
                  </div>
                )
              })}

              {errors.documents?.message ? (
                <p className="text-sm text-destructive">{errors.documents.message}</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="sticky bottom-0 z-10 -mx-6 flex items-center justify-end gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur">
            <p className="text-xs text-muted-foreground">
              {fields.length}개 문서 · {industry === 'distribution' ? '유통·공급망' : industry}
            </p>
            <PrimaryButton
              type="submit"
              size="lg"
              loading={submitting}
              loadingText="저장 중..."
              disabled={!isValid}
            >
              {activeProject ? '저장 후 다음 단계' : '프로젝트 생성'}
            </PrimaryButton>
          </div>
        </form>
      </main>

      <ProgressOverlay visible={submitting} message="입력을 저장하고 다음 단계로 이동합니다..." />
    </div>
  )
}

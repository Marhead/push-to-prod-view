import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ChevronDown, FileText, Trash2 } from 'lucide-react'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion'

import { StepHeader } from '@/widgets/step-header'
import { ProgressOverlay } from '@/widgets/progress-overlay'
import { ErrorBanner } from '@/widgets/error-banner'
import { DocumentDropzone, type DocumentDraft } from '@/features/document-upload'

import {
  INDUSTRIES,
  INDUSTRY_IDS,
  INDUSTRY_LABEL,
  DEFAULT_INDUSTRY,
  type IndustryId,
} from '@/shared/config/industry'
import { useProjectStore, useProjectListStore } from '@/entities/project'

const DOC_KINDS = [
  { value: 'brd', label: 'BRD' },
  { value: 'sales_note', label: '영업 메모' },
  { value: 'email', label: '이메일' },
  { value: 'call', label: '통화/STT' },
  { value: 'other', label: '기타' },
] as const

const documentSchema = z.object({
  kind: z.enum(['brd', 'sales_note', 'email', 'call', 'other']),
  title: z.string().min(1, '제목을 입력하세요').max(200),
  content: z.string().min(10, '본문은 최소 10자 이상이어야 합니다'),
})

const formSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력하세요').max(80),
  industry: z.enum(INDUSTRY_IDS),
  documents: z.array(documentSchema).min(1, '문서를 1개 이상 업로드하세요'),
})

type FormValues = z.infer<typeof formSchema>

const CHAR_PREVIEW = 240

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
          : [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'documents' })
  const industry = watch('industry')
  const docs = watch('documents') ?? []

  const handleAddDrafts = (drafts: DocumentDraft[]) => {
    drafts.forEach((d) => append(d, { shouldFocus: false }))
  }

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
        description="프로젝트 이름, 산업, 입력 문서(파일 업로드)를 등록합니다."
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
                프로젝트 이름과 적용 산업·도메인을 선택하세요.
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
            <CardHeader>
              <CardTitle>입력 문서 업로드</CardTitle>
              <CardDescription>
                BRD, 영업 메모, 통화 STT, 이메일 등 텍스트 파일을 드래그하거나 파일/폴더로 추가하세요.
                업로드 후 종류는 카드에서 조정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <DocumentDropzone onAdd={handleAddDrafts} disabled={submitting} />

              {fields.length === 0 ? (
                <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                  업로드된 문서가 없습니다.
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">업로드된 문서 ({fields.length})</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      for (let i = fields.length - 1; i >= 0; i--) remove(i)
                    }}
                  >
                    전체 삭제
                  </Button>
                </div>
              )}

              {fields.length > 0 ? (
                <Accordion type="multiple" className="flex flex-col gap-2">
                  {fields.map((field, index) => {
                    const doc = docs[index]
                    const docErrors = errors.documents?.[index]
                    const content = doc?.content ?? ''
                    const preview =
                      content.length > CHAR_PREVIEW
                        ? `${content.slice(0, CHAR_PREVIEW)}…`
                        : content
                    return (
                      <AccordionItem
                        key={field.id}
                        value={field.id}
                        className="overflow-hidden rounded-lg border bg-card"
                      >
                        <div className="flex items-start gap-3 px-4 py-3">
                          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                          </div>
                          <div className="grid flex-1 gap-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {doc?.title ?? field.id}
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {content.length.toLocaleString()}자
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
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
                                  <SelectTrigger className="h-8 w-[140px]">
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
                                <Badge variant="outline" className="hidden sm:inline-flex font-mono text-[10px]">
                                  #{index + 1}
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                  aria-label={`문서 ${index + 1} 삭제`}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>

                            <p className="line-clamp-2 text-xs text-muted-foreground">{preview}</p>

                            <AccordionTrigger className="self-start py-0 text-xs text-primary hover:no-underline [&[data-state=open]>svg]:rotate-180">
                              <span className="inline-flex items-center gap-1">
                                본문 보기/편집
                                <ChevronDown className="h-3 w-3 transition-transform" aria-hidden />
                              </span>
                            </AccordionTrigger>
                          </div>
                        </div>
                        <AccordionContent className="border-t bg-muted/30 px-4 py-3">
                          <div className="grid gap-2">
                            <Label htmlFor={`doc-${index}-title`}>제목</Label>
                            <Input
                              id={`doc-${index}-title`}
                              {...register(`documents.${index}.title`)}
                              aria-invalid={!!docErrors?.title}
                            />
                            {docErrors?.title ? (
                              <p className="text-xs text-destructive">{docErrors.title.message}</p>
                            ) : null}
                          </div>
                          <div className="mt-3 grid gap-2">
                            <Label htmlFor={`doc-${index}-content`}>본문</Label>
                            <Textarea
                              id={`doc-${index}-content`}
                              rows={10}
                              className="font-mono text-xs"
                              {...register(`documents.${index}.content`)}
                              aria-invalid={!!docErrors?.content}
                            />
                            {docErrors?.content ? (
                              <p className="text-xs text-destructive">{docErrors.content.message}</p>
                            ) : null}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              ) : null}

              {errors.documents?.message ? (
                <p className="text-sm text-destructive">{errors.documents.message}</p>
              ) : null}
            </CardContent>
          </Card>

          <div className="sticky bottom-0 z-10 -mx-6 flex items-center justify-end gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur">
            <p className="text-xs text-muted-foreground">
              {fields.length}개 문서 · {INDUSTRY_LABEL[industry] ?? industry}
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

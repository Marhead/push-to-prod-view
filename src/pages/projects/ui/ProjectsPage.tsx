import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderPlus, FileText, Layers, MoreVertical, Plus, Search, Trash2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { useProjectListStore, useProjectStore } from '@/entities/project'
import { useSessionStore } from '@/entities/session'
import { INDUSTRIES } from '@/shared/config/industry'
import { STEP_BY_ID } from '@/shared/config/steps'
import type { ProjectSummary } from '@/entities/project'
import { cn } from '@/shared/lib/utils'

const INDUSTRY_LABEL: Record<string, string> =
  INDUSTRIES.reduce<Record<string, string>>((acc, i) => {
    acc[i.id] = i.label
    return acc
  }, {})

const COVER_GRADIENTS = [
  'from-sky-400 via-indigo-400 to-violet-500',
  'from-emerald-400 via-teal-400 to-cyan-500',
  'from-amber-400 via-orange-400 to-rose-500',
  'from-fuchsia-400 via-pink-400 to-rose-500',
  'from-slate-400 via-slate-500 to-slate-700',
  'from-lime-400 via-emerald-400 to-teal-500',
]

const coverFor = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length]
}

const formatDate = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const projects = useProjectListStore((s) => s.projects)
  const removeProject = useProjectListStore((s) => s.removeProject)
  const setActiveProjectId = useProjectListStore((s) => s.setActiveProjectId)
  const ensureSeed = useProjectListStore((s) => s.ensureSeed)
  const resetActiveProject = useProjectStore((s) => s.reset)

  useEffect(() => {
    ensureSeed()
  }, [ensureSeed])

  const username = useSessionStore((s) => s.username)
  const signOut = useSessionStore((s) => s.signOut)

  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<ProjectSummary | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return projects
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (INDUSTRY_LABEL[p.industry] ?? '').toLowerCase().includes(q),
    )
  }, [projects, query])

  const openProject = (project: ProjectSummary) => {
    setActiveProjectId(project.id)
    navigate(`/${project.id}`)
  }

  const newProject = () => {
    resetActiveProject()
    setActiveProjectId(null)
    navigate('/projects/new')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    removeProject(pendingDelete.id)
    toast.success('프로젝트가 삭제되었습니다', { description: pendingDelete.name })
    setPendingDelete(null)
  }

  const handleSignOut = () => {
    signOut()
    toast.success('로그아웃되었습니다')
    navigate('/login', { replace: true })
  }

  const hasProjects = projects.length > 0

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-sky-500 to-indigo-600" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Domain Pack Builder
              </span>
              <h1 className="text-lg font-semibold tracking-tight">프로젝트</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {username ? (
              <Badge variant="outline" className="hidden sm:inline-flex">
                {username}
              </Badge>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="로그아웃">
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>로그아웃</TooltipContent>
            </Tooltip>
            <Button onClick={newProject} className="gap-2">
              <Plus className="h-4 w-4" />새 프로젝트
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {hasProjects ? (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="프로젝트 검색"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {filtered.length} / {projects.length}개 프로젝트
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-card px-8 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  "{query}" 와 일치하는 프로젝트가 없습니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <NewProjectCard onClick={newProject} />
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpen={() => openProject(project)}
                    onDelete={() => setPendingDelete(project)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState onCreate={newProject} />
        )}
      </main>

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트를 삭제하시겠습니까?</DialogTitle>
            <DialogDescription>
              {pendingDelete?.name} 프로젝트가 영구적으로 제거됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed bg-card px-8 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FolderPlus className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">프로젝트 없음</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        아직 생성된 Domain Pack 프로젝트가 없습니다. 새 프로젝트를 만들어 시작하세요.
      </p>
      <Button onClick={onCreate} size="lg" className="mt-6 gap-2">
        <Plus className="h-4 w-4" />새 프로젝트 만들기
      </Button>
    </div>
  )
}

function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex aspect-[4/3] min-h-[210px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10">
        <Plus className="h-6 w-6" aria-hidden />
      </div>
      <span className="text-sm font-medium">새 프로젝트</span>
    </button>
  )
}

interface ProjectCardProps {
  project: ProjectSummary
  onOpen: () => void
  onDelete: () => void
}

function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const [hover, setHover] = useState(false)
  const step = STEP_BY_ID[project.step]
  const cover = coverFor(project.id)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[4/3] w-full overflow-hidden text-left"
        aria-label={`${project.name} 열기`}
      >
        <div className={cn('absolute inset-0 bg-gradient-to-br', cover)} />
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-white/85 px-2 py-1 backdrop-blur">
          <Layers className="h-3.5 w-3.5 text-foreground" aria-hidden />
          <span className="text-xs font-medium text-foreground">{step?.shortLabel ?? '입력'}</span>
        </div>
      </button>

      <div className="flex items-start justify-between gap-2 px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onOpen}
          className="flex flex-1 flex-col items-start text-left focus:outline-none"
        >
          <span className="line-clamp-1 text-sm font-semibold">{project.name}</span>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{INDUSTRY_LABEL[project.industry] ?? project.industry}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" aria-hidden />
              {project.documentCount}
            </span>
            <span aria-hidden>·</span>
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn('h-7 w-7 shrink-0 text-muted-foreground', !hover && 'opacity-0 group-hover:opacity-100')}
              onClick={onDelete}
              aria-label="프로젝트 삭제"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>프로젝트 삭제</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

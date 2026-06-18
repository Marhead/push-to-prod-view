import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { IndustryId } from '@/shared/config/industry'
import type { StepId } from '@/shared/config/steps'

export interface ProjectSummary {
  id: string
  name: string
  industry: IndustryId
  documentCount: number
  step: StepId
  createdAt: number
  updatedAt: number
}

interface CreateProjectInput {
  name: string
  industry: IndustryId
  documentCount?: number
  step?: StepId
}

interface ProjectListActions {
  createProject: (input: CreateProjectInput) => string
  updateProject: (
    id: string,
    patch: Partial<Omit<ProjectSummary, 'id' | 'createdAt'>>,
  ) => void
  removeProject: (id: string) => void
  setActiveProjectId: (id: string | null) => void
  clear: () => void
}

interface ProjectListState {
  projects: ProjectSummary[]
  activeProjectId: string | null
}

const genId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `prj_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`

export const useProjectListStore = create<ProjectListState & ProjectListActions>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,
      createProject: ({ name, industry, documentCount = 0, step = 'input' }) => {
        const id = genId()
        const now = Date.now()
        const project: ProjectSummary = {
          id,
          name,
          industry,
          documentCount,
          step,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => ({
          projects: [project, ...s.projects],
          activeProjectId: id,
        }))
        return id
      },
      updateProject: (id, patch) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
          ),
        })),
      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
        })),
      setActiveProjectId: (id) => set({ activeProjectId: id }),
      clear: () => set({ projects: [], activeProjectId: null }),
    }),
    {
      name: 'domain-pack-builder-projects',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
    },
  ),
)

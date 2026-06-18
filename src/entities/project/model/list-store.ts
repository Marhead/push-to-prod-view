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
  ensureSeed: () => void
  clear: () => void
}

interface ProjectListState {
  projects: ProjectSummary[]
  activeProjectId: string | null
}

const genId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `prj_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`

const DAY = 1000 * 60 * 60 * 24
const buildMockProjects = (): ProjectSummary[] => {
  const now = Date.now()
  return [
    {
      id: '1c367343-b93c-409a-b9c5-21d5b49f9cd6',
      name: 'push-to-prod-core',
      industry: 'distribution',
      documentCount: 8,
      step: 'result',
      createdAt: now - DAY * 7,
      updatedAt: now - DAY * 2,
    },
    {
      id: '2c367343-b93c-409a-b9c5-21d5b49f9cd7',
      name: 'ABC상사 PoC',
      industry: 'inventory',
      documentCount: 5,
      step: 'result',
      createdAt: now - DAY * 4,
      updatedAt: now - DAY * 1,
    },
    {
      id: '3c367343-b93c-409a-b9c5-21d5b49f9cd8',
      name: '디피니트 수요 예측',
      industry: 'forecasting',
      documentCount: 3,
      step: 'result',
      createdAt: now - DAY * 12,
      updatedAt: now - DAY * 6,
    },
    {
      id: '4c367343-b93c-409a-b9c5-21d5b49f9cd9',
      name: '품질 관리 PoC',
      industry: 'quality',
      documentCount: 2,
      step: 'result',
      createdAt: now - DAY * 1,
      updatedAt: now - DAY * 1,
    },
  ]
}

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
      ensureSeed: () =>
        set((s) => (s.projects.length > 0 ? s : { ...s, projects: buildMockProjects() })),
      clear: () => set({ projects: [], activeProjectId: null }),
    }),
    {
      name: 'domain-pack-builder-projects',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
    },
  ),
)

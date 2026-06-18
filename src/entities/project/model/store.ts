import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_INDUSTRY, type IndustryId } from '@/shared/config/industry'
import type { StepId } from '@/shared/config/steps'
import type {
  BusinessQuestion,
  Ontology,
  ProblemProfile,
  ProjectSeed,
  ProjectStateData,
  RawDocument,
} from './types'

interface ProjectActions {
  setIndustry: (industry: IndustryId) => void
  setMatrix: (matrix: Record<string, unknown> | null) => void
  setRawData: (docs: RawDocument[]) => void
  addDocument: (doc: Omit<RawDocument, 'id'>) => void
  updateDocument: (id: string, patch: Partial<Omit<RawDocument, 'id'>>) => void
  removeDocument: (id: string) => void
  setProjectId: (id: string | null) => void
  setBrd: (brd: ProblemProfile | null) => void
  setQuestions: (qs: BusinessQuestion[] | null) => void
  setProjectSeed: (seed: ProjectSeed | null) => void
  setOntology: (ontology: Ontology | null) => void
  setLoading: (step: StepId, value: boolean) => void
  setError: (step: StepId, message: string | null) => void
  reset: () => void
}

const INITIAL: ProjectStateData = {
  projectId: null,
  industry: DEFAULT_INDUSTRY,
  matrix: null,
  rawData: [],
  brd: null,
  questions: null,
  projectSeed: null,
  ontology: null,
  loading: {},
  errors: {},
}

const genId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `doc_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`

export const useProjectStore = create<ProjectStateData & ProjectActions>()(
  persist(
    (set) => ({
      ...INITIAL,
      setIndustry: (industry) => set({ industry }),
      setMatrix: (matrix) => set({ matrix }),
      setRawData: (rawData) => set({ rawData }),
      addDocument: (doc) =>
        set((s) => ({ rawData: [...s.rawData, { id: genId(), ...doc }] })),
      updateDocument: (id, patch) =>
        set((s) => ({
          rawData: s.rawData.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      removeDocument: (id) =>
        set((s) => ({ rawData: s.rawData.filter((d) => d.id !== id) })),
      setProjectId: (projectId) => set({ projectId }),
      setBrd: (brd) => set({ brd }),
      setQuestions: (questions) => set({ questions }),
      setProjectSeed: (projectSeed) => set({ projectSeed }),
      setOntology: (ontology) => set({ ontology }),
      setLoading: (step, value) =>
        set((s) => ({ loading: { ...s.loading, [step]: value } })),
      setError: (step, message) =>
        set((s) => ({ errors: { ...s.errors, [step]: message } })),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'domain-pack-builder',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        projectId: s.projectId,
        industry: s.industry,
        matrix: s.matrix,
        rawData: s.rawData,
        brd: s.brd,
        questions: s.questions,
        projectSeed: s.projectSeed,
        ontology: s.ontology,
      }),
      version: 1,
    },
  ),
)

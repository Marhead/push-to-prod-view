import type { IndustryId } from '@/shared/config/industry'
import type { StepId } from '@/shared/config/steps'

export type DocumentKind = 'brd' | 'sales_note' | 'email' | 'call' | 'other'

export interface RawDocument {
  id: string
  kind: DocumentKind
  title: string
  content: string
}

export interface ProvenanceItem {
  text: string
  sources: string[]
}

export interface ProblemProfile {
  goals: ProvenanceItem[]
  pain_points: ProvenanceItem[]
  kpis: ProvenanceItem[]
  systems: string[]
  constraints: ProvenanceItem[]
  stakeholders: string[]
}

export type DataStatus = 'available' | `missing:${string}` | string

export interface BusinessQuestion {
  id: string
  question: string
  category: string
  rationale: string
  linked_sources: string[]
  data_status: DataStatus
}

export type OntologyNodeType =
  | 'entity'
  | 'event'
  | 'kpi'
  | 'workflow'
  | 'source'
  | 'class'

export interface OntologyNode {
  id: string
  name: string
  type: OntologyNodeType
  maps_from?: string[]
  answers?: string[]
}

export interface OntologyRelation {
  source: string
  target: string
  label: string
}

export interface Ontology {
  nodes: OntologyNode[]
  relations: OntologyRelation[]
}

export interface GapAnalysis {
  matched?: unknown[]
  missing?: unknown[]
  extra?: unknown[]
}

export interface ProjectSeed {
  reference?: unknown
  expected?: unknown
  gap?: GapAnalysis
  gold_questions?: string[]
}

export type StepLoading = Partial<Record<StepId, boolean>>
export type StepErrors = Partial<Record<StepId, string | null>>

export interface ProjectStateData {
  projectId: string | null
  industry: IndustryId
  matrix: Record<string, unknown> | null
  rawData: RawDocument[]
  brd: ProblemProfile | null
  questions: BusinessQuestion[] | null
  projectSeed: ProjectSeed | null
  ontology: Ontology | null
  loading: StepLoading
  errors: StepErrors
}

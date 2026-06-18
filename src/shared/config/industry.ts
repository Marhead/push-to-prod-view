export type IndustryId =
  | 'distribution'
  | 'inventory'
  | 'forecasting'
  | 'manufacturing'
  | 'logistics'
  | 'sales'
  | 'procurement'
  | 'operations'
  | 'quality'
  | 'finance'

export interface IndustryOption {
  id: IndustryId
  label: string
  description: string
}

export const INDUSTRIES: IndustryOption[] = [
  { id: 'distribution', label: '유통·공급망', description: '주문·출하·납기 흐름' },
  { id: 'inventory', label: '재고 관리', description: '안전재고·회전·결품 분석' },
  { id: 'forecasting', label: '수요 예측', description: '판매·계절성·프로모션' },
  { id: 'manufacturing', label: '생산', description: '공정·라인·BOM·가동률' },
  { id: 'logistics', label: '물류·운송', description: '경로·차량·창고' },
  { id: 'sales', label: '영업·고객', description: '파이프라인·고객 행동' },
  { id: 'procurement', label: '구매·조달', description: '공급사·계약·리드타임' },
  { id: 'operations', label: '운영 전반', description: '오퍼레이션 KPI·SLA' },
  { id: 'quality', label: '품질 관리', description: '결함·불량률·6시그마' },
  { id: 'finance', label: '재무·원가', description: '원가·수익성·예산' },
]

export const INDUSTRY_IDS = INDUSTRIES.map((i) => i.id) as [IndustryId, ...IndustryId[]]

export const INDUSTRY_LABEL: Record<IndustryId, string> = INDUSTRIES.reduce(
  (acc, i) => {
    acc[i.id] = i.label
    return acc
  },
  {} as Record<IndustryId, string>,
)

export const DEFAULT_INDUSTRY: IndustryId = 'distribution'

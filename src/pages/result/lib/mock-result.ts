import type { IndustryId } from '@/shared/config/industry'

export interface ResultQuestion {
  id: string
  question: string
  category: string
  rationale: string
  linked_sources: string[]
  data_status: 'available' | string
}

export type ResultNodeType = 'entity' | 'event' | 'kpi' | 'workflow' | 'source' | 'class'

export interface ResultNode {
  id: string
  name: string
  type: ResultNodeType
  maps_from: string[]
  answers: string[]
}

export interface ResultRelation {
  source: string
  target: string
  label: string
}

export interface ResultWorkflow {
  id: string
  name: string
  steps: string[]
  answers_question: string
  uses_nodes: string[]
}

export interface ResultPack {
  industry: IndustryId
  business_questions: ResultQuestion[]
  ontology: { nodes: ResultNode[]; relations: ResultRelation[] }
  workflows: ResultWorkflow[]
  demo_scenario: { narrative: string; steps: string[]; based_on: string }
  required_sources: { available: string[]; needed: string[] }
  export_markdown: string
}

interface PoolEntry {
  name: string
  maps_from: string[]
  type: ResultNodeType
}

const POOL_FALLBACK: PoolEntry[] = [
  { name: '엔티티 A', maps_from: ['table_a'], type: 'entity' },
  { name: '엔티티 B', maps_from: ['table_b'], type: 'entity' },
  { name: '이벤트', maps_from: ['events'], type: 'event' },
  { name: 'KPI', maps_from: [], type: 'kpi' },
  { name: '워크플로우', maps_from: [], type: 'workflow' },
  { name: '카테고리', maps_from: ['categories'], type: 'class' },
]

const POOLS: Record<IndustryId, PoolEntry[]> = {
  distribution: [
    { name: '고객주문', maps_from: ['orders.o_orderkey'], type: 'entity' },
    { name: '출하라인', maps_from: ['lineitem.l_shipdate'], type: 'event' },
    { name: '공급사', maps_from: ['supplier.s_suppkey'], type: 'entity' },
    { name: '고객', maps_from: ['customer.c_custkey'], type: 'entity' },
    { name: '부품', maps_from: ['part.p_partkey'], type: 'entity' },
    { name: '재고', maps_from: ['partsupp.ps_availqty'], type: 'entity' },
    { name: '납기 준수율', maps_from: ['lineitem.l_commitdate'], type: 'kpi' },
    { name: '결품률', maps_from: ['partsupp.ps_availqty'], type: 'kpi' },
    { name: '회전율', maps_from: ['lineitem.l_quantity'], type: 'kpi' },
    { name: '주문 처리', maps_from: ['orders', 'lineitem'], type: 'workflow' },
    { name: '발주', maps_from: ['supplier', 'partsupp'], type: 'event' },
    { name: '입고', maps_from: ['lineitem.l_receiptdate'], type: 'event' },
    { name: '국가', maps_from: ['nation.n_nationkey'], type: 'class' },
    { name: '지역', maps_from: ['region.r_regionkey'], type: 'class' },
  ],
  inventory: [
    { name: '재고 단품', maps_from: ['stock.sku'], type: 'entity' },
    { name: '안전재고', maps_from: ['policy.safety_stock'], type: 'kpi' },
    { name: '회전율', maps_from: ['stock.turnover'], type: 'kpi' },
    { name: '결품 이벤트', maps_from: ['stockout_log'], type: 'event' },
    { name: '입고', maps_from: ['receipts'], type: 'event' },
    { name: '출고', maps_from: ['shipments'], type: 'event' },
    { name: '창고', maps_from: ['warehouse'], type: 'entity' },
    { name: '위치 로케이션', maps_from: ['locations'], type: 'entity' },
    { name: '재고 분석', maps_from: [], type: 'workflow' },
    { name: '품목 카테고리', maps_from: ['category'], type: 'class' },
    { name: 'SKU 마스터', maps_from: ['sku_master'], type: 'entity' },
    { name: '재고 정확도', maps_from: [], type: 'kpi' },
  ],
  forecasting: [
    { name: '판매 이력', maps_from: ['sales_history'], type: 'entity' },
    { name: '예측값', maps_from: ['forecasts'], type: 'entity' },
    { name: '예측 오차 (MAPE)', maps_from: [], type: 'kpi' },
    { name: '계절성 지수', maps_from: [], type: 'kpi' },
    { name: '프로모션', maps_from: ['promotions'], type: 'event' },
    { name: '판매 카테고리', maps_from: ['category'], type: 'class' },
    { name: '수요 예측', maps_from: [], type: 'workflow' },
    { name: '특수 이벤트', maps_from: ['events'], type: 'event' },
    { name: '카테고리 트리', maps_from: ['category_tree'], type: 'class' },
    { name: '판매 채널', maps_from: ['channels'], type: 'entity' },
    { name: '시즌 적중률', maps_from: [], type: 'kpi' },
    { name: '실판매', maps_from: ['actuals'], type: 'event' },
  ],
  manufacturing: [
    { name: '생산 라인', maps_from: ['line'], type: 'entity' },
    { name: '공정', maps_from: ['process_step'], type: 'workflow' },
    { name: 'BOM', maps_from: ['bom'], type: 'class' },
    { name: '가동률 (OEE)', maps_from: [], type: 'kpi' },
    { name: '불량률', maps_from: ['defects'], type: 'kpi' },
    { name: '작업 지시', maps_from: ['work_order'], type: 'event' },
    { name: '자재', maps_from: ['materials'], type: 'entity' },
    { name: '생산 계획', maps_from: ['plan'], type: 'entity' },
    { name: '설비', maps_from: ['equipment'], type: 'entity' },
    { name: '품질 검사', maps_from: ['qc'], type: 'event' },
    { name: '교대조', maps_from: ['shift'], type: 'class' },
    { name: '다운타임', maps_from: ['downtime'], type: 'event' },
  ],
  logistics: [
    { name: '운송 차량', maps_from: ['vehicle'], type: 'entity' },
    { name: '배송 경로', maps_from: ['route'], type: 'workflow' },
    { name: '창고', maps_from: ['warehouse'], type: 'entity' },
    { name: '배송 완료', maps_from: ['delivery'], type: 'event' },
    { name: '운임', maps_from: ['cost'], type: 'kpi' },
    { name: '도착 ETA', maps_from: ['eta'], type: 'kpi' },
    { name: '기사', maps_from: ['driver'], type: 'entity' },
    { name: '화물', maps_from: ['shipment'], type: 'entity' },
    { name: '경로 최적화', maps_from: [], type: 'workflow' },
    { name: '지연 사고', maps_from: ['incident'], type: 'event' },
    { name: '터미널', maps_from: ['terminal'], type: 'class' },
  ],
  sales: [
    { name: '영업 기회', maps_from: ['opportunity'], type: 'entity' },
    { name: '거래 단계', maps_from: ['stage'], type: 'class' },
    { name: '고객 계정', maps_from: ['account'], type: 'entity' },
    { name: '컨택트', maps_from: ['contact'], type: 'entity' },
    { name: 'CLV', maps_from: [], type: 'kpi' },
    { name: '전환율', maps_from: [], type: 'kpi' },
    { name: '딜 클로즈', maps_from: ['won_deal'], type: 'event' },
    { name: '캠페인', maps_from: ['campaign'], type: 'event' },
    { name: '파이프라인', maps_from: ['pipeline'], type: 'workflow' },
    { name: '세일즈 영역', maps_from: ['territory'], type: 'class' },
  ],
  procurement: [
    { name: '공급사', maps_from: ['vendor'], type: 'entity' },
    { name: '계약', maps_from: ['contract'], type: 'entity' },
    { name: '발주서', maps_from: ['po'], type: 'event' },
    { name: '수령', maps_from: ['receipt'], type: 'event' },
    { name: '리드타임', maps_from: [], type: 'kpi' },
    { name: '단가 안정성', maps_from: [], type: 'kpi' },
    { name: '품목 마스터', maps_from: ['item'], type: 'class' },
    { name: '공급사 평가', maps_from: [], type: 'workflow' },
    { name: '구매 분석', maps_from: [], type: 'workflow' },
    { name: '결제 조건', maps_from: ['payment_terms'], type: 'class' },
  ],
  operations: [
    { name: '운영 KPI', maps_from: ['kpi_log'], type: 'kpi' },
    { name: '서비스 SLA', maps_from: [], type: 'kpi' },
    { name: '인시던트', maps_from: ['incident'], type: 'event' },
    { name: '서비스', maps_from: ['service'], type: 'entity' },
    { name: '가동률', maps_from: [], type: 'kpi' },
    { name: '온콜 로테이션', maps_from: ['oncall'], type: 'workflow' },
    { name: '알람', maps_from: ['alerts'], type: 'event' },
    { name: '리소스', maps_from: ['resources'], type: 'entity' },
    { name: '환경', maps_from: ['env'], type: 'class' },
    { name: '배포', maps_from: ['deploy'], type: 'event' },
  ],
  quality: [
    { name: '결함', maps_from: ['defect'], type: 'entity' },
    { name: '검사 항목', maps_from: ['inspection_item'], type: 'class' },
    { name: '품질 검사', maps_from: ['inspection'], type: 'event' },
    { name: '불량률', maps_from: [], type: 'kpi' },
    { name: '재작업', maps_from: ['rework'], type: 'event' },
    { name: '클레임', maps_from: ['claim'], type: 'event' },
    { name: '6시그마 지표', maps_from: [], type: 'kpi' },
    { name: '품질 보고', maps_from: [], type: 'workflow' },
    { name: '제품 라인', maps_from: ['product_line'], type: 'class' },
    { name: '검사 결과', maps_from: ['qc_result'], type: 'entity' },
  ],
  finance: [
    { name: '계정 과목', maps_from: ['account'], type: 'class' },
    { name: '비용 센터', maps_from: ['cost_center'], type: 'entity' },
    { name: '예산', maps_from: ['budget'], type: 'entity' },
    { name: '실적', maps_from: ['actuals'], type: 'event' },
    { name: '수익성', maps_from: [], type: 'kpi' },
    { name: '운영 마진', maps_from: [], type: 'kpi' },
    { name: '월간 마감', maps_from: [], type: 'workflow' },
    { name: '거래 분개', maps_from: ['journal'], type: 'event' },
    { name: '환율', maps_from: ['fx'], type: 'class' },
    { name: '원가 배부', maps_from: [], type: 'workflow' },
  ],
}

const RELATION_LABELS = ['연관', '참조', '포함', '집계', '의존', '추적', '소속', '발생']

const QUESTION_TEMPLATES: Array<(a: ResultNode, b?: ResultNode) => string> = [
  (a, b) => (b ? `${a.name}별 ${b.name} 추이는?` : `${a.name}의 변동 추이는?`),
  (a, b) => (b ? `${a.name}과 ${b.name}의 상관 관계는?` : `${a.name}에 영향을 주는 요인은?`),
  (a) => `상위 ${a.name} TOP 10은?`,
  (a) => `${a.name}의 이상 패턴은 무엇인가?`,
  (a, b) => (b ? `${a.name}이 ${b.name}에 미치는 효과는?` : `${a.name}의 핵심 드라이버는?`),
  (a) => `${a.name} 임계 초과 알람을 어떻게 정의할까?`,
  (a, b) => (b ? `${a.name} 대비 ${b.name} 비율은 적정한가?` : `${a.name} 적정 수준은?`),
  (a) => `${a.name}의 월간 추세 변화는?`,
]

const QUESTION_CATEGORIES = ['추세 분석', '드라이버 분석', '랭킹', '이상 탐지', '벤치마크', '알람']

const WORKFLOW_STEP_TEMPLATES: Array<(node: ResultNode) => string> = [
  (n) => `${n.name} 데이터 수집`,
  (n) => `${n.name} 정제·집계`,
  (n) => `${n.name} 임계값 평가`,
  (n) => `${n.name} 결과 전파`,
]

function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function pickInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pad2(n: number): string {
  return n < 10 ? `n0${n}` : `n${n}`
}

export function buildMockResult(
  industry: IndustryId,
  projectName: string,
  projectId = 'default',
): ResultPack {
  const rng = mulberry32(fnv1a(`${projectId}|${industry}`))

  const pool = POOLS[industry] ?? POOL_FALLBACK
  const nodeCount = pickInt(rng, 3, Math.min(12, pool.length))
  const picked = shuffle(pool, rng).slice(0, nodeCount)

  const nodes: ResultNode[] = picked.map((entry, idx) => ({
    id: pad2(idx + 1),
    name: entry.name,
    type: entry.type,
    maps_from: entry.maps_from,
    answers: [],
  }))

  const relations: ResultRelation[] = []
  for (let i = 1; i < nodes.length; i++) {
    const parent = nodes[Math.floor(rng() * i)]
    relations.push({
      source: parent.id,
      target: nodes[i].id,
      label: pick(RELATION_LABELS, rng),
    })
  }
  const extraCount = Math.max(0, Math.floor(nodes.length * (0.3 + rng() * 0.3)))
  for (let i = 0; i < extraCount; i++) {
    const a = pick(nodes, rng)
    const b = pick(nodes, rng)
    if (a.id === b.id) continue
    if (relations.some((r) => r.source === a.id && r.target === b.id)) continue
    relations.push({ source: a.id, target: b.id, label: pick(RELATION_LABELS, rng) })
  }

  const questionCount = pickInt(rng, 4, Math.min(7, Math.max(4, nodes.length)))
  const shuffledNodes = shuffle(nodes, rng)
  const business_questions: ResultQuestion[] = Array.from({ length: questionCount }).map((_, idx) => {
    const id = `q${idx + 1}`
    const primary = shuffledNodes[idx % shuffledNodes.length]
    const secondary = shuffledNodes[(idx + 1) % shuffledNodes.length]
    const template = pick(QUESTION_TEMPLATES, rng)
    const question = template(primary, secondary)
    const usesSecondary = question.includes(secondary.name) && secondary.id !== primary.id
    const useNodes = usesSecondary ? [primary, secondary] : [primary]
    const sources = useNodes.flatMap((n) => n.maps_from).filter(Boolean)
    const missing = rng() < 0.25
    useNodes.forEach((n) => n.answers.push(id))
    return {
      id,
      question,
      category: pick(QUESTION_CATEGORIES, rng),
      rationale: `${primary.name} 중심 분석`,
      linked_sources: sources.length > 0 ? sources : [primary.maps_from[0] ?? primary.name],
      data_status: missing
        ? `missing:${primary.name} 세부 항목`
        : 'available',
    }
  })

  const workflowCount = pickInt(rng, 1, Math.min(3, business_questions.length))
  const workflows: ResultWorkflow[] = Array.from({ length: workflowCount }).map((_, idx) => {
    const q = business_questions[idx]
    const anchor = nodes.find((n) => n.answers.includes(q.id)) ?? nodes[0]
    const partners = shuffle(
      nodes.filter((n) => n.id !== anchor.id),
      rng,
    ).slice(0, pickInt(rng, 1, Math.min(3, nodes.length - 1)))
    const used = [anchor, ...partners]
    const steps = WORKFLOW_STEP_TEMPLATES.map((tpl) => tpl(used[Math.floor(rng() * used.length)]))
    return {
      id: `wf${idx + 1}`,
      name: `${anchor.name} 분석 워크플로우`,
      steps,
      answers_question: q.id,
      uses_nodes: used.map((n) => n.id),
    }
  })

  const demoWf = workflows[0]
  const demo_scenario = demoWf
    ? {
        narrative: `${projectName} 의 운영팀이 매일 아침 "${demoWf.name}" 결과를 자동 보고받는다.`,
        steps: demoWf.steps,
        based_on: demoWf.id,
      }
    : {
        narrative: `${projectName} — 워크플로우가 아직 정의되지 않았습니다.`,
        steps: [],
        based_on: '',
      }

  const allAvailable = Array.from(
    new Set(business_questions.filter((q) => q.data_status === 'available').flatMap((q) => q.linked_sources)),
  )
  const needed = Array.from(
    new Set(
      business_questions
        .filter((q) => q.data_status !== 'available')
        .map((q) => q.data_status.replace(/^missing:/, '')),
    ),
  )
  if (needed.length === 0 && rng() < 0.6) {
    needed.push(`${pick(nodes, rng).name} 상세 메타`)
  }

  const required_sources = {
    available: allAvailable,
    needed,
  }

  const export_markdown = `# ${projectName} — PoC 셋업 체크리스트

## 1. 비즈니스 질문 (${business_questions.length})
${business_questions
    .map((q) => `- **${q.id}** ${q.question}  _(${q.category} · ${q.data_status})_`)
    .join('\n')}

## 2. 온톨로지 노드 (${nodes.length}) · 관계 (${relations.length})
${nodes.map((n) => `- \`${n.id}\` ${n.name} · type=${n.type}`).join('\n')}

## 3. 워크플로우 (${workflows.length})
${workflows.map((w) => `- **${w.name}** ← ${w.answers_question}`).join('\n')}

## 4. 데모 시나리오
${demo_scenario.narrative}

## 5. 필요 데이터
**확보됨**
${required_sources.available.map((s) => `- ${s}`).join('\n') || '- (없음)'}

**확보 필요**
${required_sources.needed.map((s) => `- ${s}`).join('\n') || '- (없음)'}
`

  return {
    industry,
    business_questions,
    ontology: { nodes, relations },
    workflows,
    demo_scenario,
    required_sources,
    export_markdown,
  }
}

import type { IndustryId } from '@/shared/config/industry'

export interface ResultQuestion {
  id: string
  question: string
  category: string
  rationale: string
  linked_sources: string[]
  data_status: 'available' | string
}

export interface ResultNode {
  id: string
  name: string
  type: 'entity' | 'event' | 'kpi'
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

export function buildMockResult(industry: IndustryId, projectName: string): ResultPack {
  const business_questions: ResultQuestion[] = [
    {
      id: 'q1',
      question: '약속 납기 대비 출하 지연 위험 주문은?',
      category: '납기·리드타임',
      rationale: '납기 95% 목표 직결',
      linked_sources: ['orders.o_orderdate', 'lineitem.l_commitdate', 'lineitem.l_shipdate'],
      data_status: 'available',
    },
    {
      id: 'q2',
      question: '수익 기여 상위 공급사는?',
      category: '공급사 분석',
      rationale: '구매 우선순위 재조정',
      linked_sources: ['supplier.s_suppkey', 'lineitem.l_extendedprice'],
      data_status: 'available',
    },
    {
      id: 'q3',
      question: '지역별 안전재고 적정 수준은?',
      category: '재고',
      rationale: '결품/과잉 균형',
      linked_sources: ['partsupp.ps_availqty'],
      data_status: 'missing:지역별 리드타임',
    },
    {
      id: 'q4',
      question: '계절성 주문 패턴이 강한 카테고리는?',
      category: '수요 예측',
      rationale: '판촉/구매 계획 입력',
      linked_sources: ['orders.o_orderdate', 'part.p_type'],
      data_status: 'available',
    },
  ]

  const nodes: ResultNode[] = [
    { id: 'n_order', name: '고객주문', type: 'entity', maps_from: ['orders'], answers: ['q1', 'q4'] },
    { id: 'n_line', name: '출하라인', type: 'event', maps_from: ['lineitem'], answers: ['q1'] },
    { id: 'n_supplier', name: '공급사', type: 'entity', maps_from: ['supplier'], answers: ['q2'] },
    { id: 'n_kpi_otd', name: '납기 준수율', type: 'kpi', maps_from: [], answers: ['q1'] },
  ]

  const relations: ResultRelation[] = [
    { source: 'n_order', target: 'n_line', label: '주문-포함→출하라인' },
    { source: 'n_supplier', target: 'n_line', label: '공급사-제공→출하라인' },
    { source: 'n_order', target: 'n_kpi_otd', label: '주문-집계→납기 준수율' },
  ]

  const workflows: ResultWorkflow[] = [
    {
      id: 'wf1',
      name: '납기 지연 조기 경보',
      steps: ['지연 라인 추출', '주문 위험도 집계', '임계 초과 경보'],
      answers_question: 'q1',
      uses_nodes: ['n_order', 'n_line', 'n_kpi_otd'],
    },
    {
      id: 'wf2',
      name: '공급사 수익 기여 랭킹',
      steps: ['주문-출하 조인', '공급사별 매출 합산', '상위 10개 랭킹'],
      answers_question: 'q2',
      uses_nodes: ['n_supplier', 'n_line'],
    },
  ]

  const demo_scenario = {
    narrative: `${projectName} 의 운영팀이 매일 아침 납기 지연 위험 주문을 자동 알림으로 받는다.`,
    steps: [
      '지연 라인 추출 (l_commitdate < today AND l_shipdate IS NULL)',
      '주문 위험도 점수화 (라인 수 + 잔여일)',
      '임계 초과 시 슬랙 채널 알림 전송',
    ],
    based_on: 'wf1',
  }

  const required_sources = {
    available: [
      'orders.o_orderdate',
      'lineitem.l_commitdate',
      'lineitem.l_shipdate',
      'supplier.s_suppkey',
      'lineitem.l_extendedprice',
      'partsupp.ps_availqty',
    ],
    needed: ['공급사 리드타임 (표준 미보유 → 확보 필요)', '지역별 안전재고 정책'],
  }

  const export_markdown = `# ${projectName} — PoC 셋업 체크리스트

## 1. 비즈니스 질문 (4)
${business_questions.map((q) => `- **${q.id}** ${q.question}  _(${q.category})_`).join('\n')}

## 2. 온톨로지 노드 (${nodes.length}) · 관계 (${relations.length})
${nodes.map((n) => `- \`${n.id}\` ${n.name} · type=${n.type}`).join('\n')}

## 3. 워크플로우 (${workflows.length})
${workflows.map((w) => `- **${w.name}** ← ${w.answers_question}`).join('\n')}

## 4. 데모 시나리오
${demo_scenario.narrative}

## 5. 필요 데이터
**확보됨**
${required_sources.available.map((s) => `- ${s}`).join('\n')}

**확보 필요**
${required_sources.needed.map((s) => `- ${s}`).join('\n')}
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

import type { Edge, Node } from '@xyflow/react'
import type { OntologyNodeType } from '@/entities/project'

export interface OntologyFlowNodeData extends Record<string, unknown> {
  label: string
  type: OntologyNodeType
  mapsFrom?: string[]
  answers?: string[]
}

export type OntologyFlowNode = Node<OntologyFlowNodeData>

export interface OntologyInput {
  nodes: Array<{
    id: string
    name: string
    type: OntologyNodeType
    maps_from?: string[]
    answers?: string[]
  }>
  relations: Array<{ source: string; target: string; label: string }>
}

export function ontologyToFlow(o: OntologyInput): {
  nodes: OntologyFlowNode[]
  edges: Edge[]
} {
  const nodes: OntologyFlowNode[] = o.nodes.map((n) => ({
    id: n.id,
    type: 'ontology',
    position: { x: 0, y: 0 },
    data: {
      label: n.name,
      type: n.type,
      mapsFrom: n.maps_from,
      answers: n.answers,
    },
  }))

  const edges: Edge[] = o.relations.map((r, i) => ({
    id: `e_${i}_${r.source}_${r.target}`,
    source: r.source,
    target: r.target,
    label: r.label,
    type: 'smoothstep',
    animated: false,
    labelStyle: { fontSize: 11, fill: 'hsl(215 16% 47%)' },
    labelBgStyle: { fill: 'hsl(0 0% 100%)', fillOpacity: 0.9 },
    labelBgPadding: [4, 2],
    labelBgBorderRadius: 4,
    style: { stroke: 'hsl(215 20% 65%)', strokeWidth: 1.5 },
  }))

  return { nodes, edges }
}

import dagre from '@dagrejs/dagre'
import { Position, type Edge } from '@xyflow/react'
import type { OntologyFlowNode } from './ontology-to-flow'

const NODE_WIDTH = 180
const NODE_HEIGHT = 64

export type LayoutDirection = 'LR' | 'TB'

export function applyDagreLayout(
  nodes: OntologyFlowNode[],
  edges: Edge[],
  direction: LayoutDirection = 'LR',
): OntologyFlowNode[] {
  if (nodes.length === 0) return nodes

  const graph = new dagre.graphlib.Graph()
  graph.setDefaultEdgeLabel(() => ({}))
  graph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 80, marginx: 16, marginy: 16 })

  nodes.forEach((n) => {
    graph.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })
  edges.forEach((e) => {
    graph.setEdge(e.source, e.target)
  })

  dagre.layout(graph)

  return nodes.map((n) => {
    const pos = graph.node(n.id)
    return {
      ...n,
      position: {
        x: (pos?.x ?? 0) - NODE_WIDTH / 2,
        y: (pos?.y ?? 0) - NODE_HEIGHT / 2,
      },
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
    }
  })
}

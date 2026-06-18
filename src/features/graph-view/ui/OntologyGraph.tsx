import { useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ontologyToFlow, type OntologyInput } from '../lib/ontology-to-flow'
import { applyDagreLayout, type LayoutDirection } from '../lib/apply-dagre-layout'
import { OntologyNodeView } from './OntologyNode'

const NODE_TYPES = { ontology: OntologyNodeView }

interface OntologyGraphProps {
  ontology: OntologyInput
  direction?: LayoutDirection
  className?: string
  height?: number | string
}

export function OntologyGraph({
  ontology,
  direction = 'LR',
  className,
  height = 480,
}: OntologyGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const flow = ontologyToFlow(ontology)
    return { nodes: applyDagreLayout(flow.nodes, flow.edges, direction), edges: flow.edges }
  }, [ontology, direction])

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap pannable zoomable className="!rounded-md !border" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  )
}

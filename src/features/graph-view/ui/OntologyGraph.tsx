import { useEffect, useMemo } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
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
  fitPadding?: number
}

export function OntologyGraph({
  ontology,
  direction = 'LR',
  className,
  height = 480,
  fitPadding = 0.35,
}: OntologyGraphProps) {
  return (
    <ReactFlowProvider>
      <OntologyGraphInner
        ontology={ontology}
        direction={direction}
        className={className}
        height={height}
        fitPadding={fitPadding}
      />
    </ReactFlowProvider>
  )
}

type InnerProps = {
  ontology: OntologyInput
  direction: LayoutDirection
  className?: string
  height: number | string
  fitPadding: number
}

function OntologyGraphInner({ ontology, direction, className, height, fitPadding }: InnerProps) {
  const layout = useMemo(() => {
    const flow = ontologyToFlow(ontology)
    return { nodes: applyDagreLayout(flow.nodes, flow.edges, direction), edges: flow.edges }
  }, [ontology, direction])

  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges)

  useEffect(() => {
    setNodes(layout.nodes)
    setEdges(layout.edges)
  }, [layout, setNodes, setEdges])

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        fitView
        fitViewOptions={{ padding: fitPadding, minZoom: 0.4, maxZoom: 1.4 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable className="!rounded-md !border" />
      </ReactFlow>
    </div>
  )
}

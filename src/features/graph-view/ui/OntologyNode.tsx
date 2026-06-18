import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { OntologyNodeType } from '@/entities/project'
import { cn } from '@/shared/lib/utils'
import type { OntologyFlowNode } from '../lib/ontology-to-flow'

const TYPE_STYLE: Record<OntologyNodeType, { border: string; bg: string; text: string; chip: string; label: string }> = {
  entity: {
    border: 'border-sky-400',
    bg: 'bg-sky-50',
    text: 'text-sky-900',
    chip: 'bg-sky-500 text-white',
    label: 'ENTITY',
  },
  event: {
    border: 'border-violet-400',
    bg: 'bg-violet-50',
    text: 'text-violet-900',
    chip: 'bg-violet-500 text-white',
    label: 'EVENT',
  },
  kpi: {
    border: 'border-amber-400',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    chip: 'bg-amber-500 text-white',
    label: 'KPI',
  },
  workflow: {
    border: 'border-emerald-400',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    chip: 'bg-emerald-500 text-white',
    label: 'WORKFLOW',
  },
  source: {
    border: 'border-slate-400',
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    chip: 'bg-slate-500 text-white',
    label: 'SOURCE',
  },
  class: {
    border: 'border-rose-400',
    bg: 'bg-rose-50',
    text: 'text-rose-900',
    chip: 'bg-rose-500 text-white',
    label: 'CLASS',
  },
}

export function OntologyNodeView({ data }: NodeProps<OntologyFlowNode>) {
  const style = TYPE_STYLE[data.type] ?? TYPE_STYLE.entity
  return (
    <div
      className={cn(
        'flex min-w-[160px] flex-col gap-1 rounded-md border-2 px-3 py-2 shadow-sm',
        style.border,
        style.bg,
        style.text,
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-slate-400" />
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider',
            style.chip,
          )}
        >
          {style.label}
        </span>
        {data.answers && data.answers.length > 0 ? (
          <span className="text-[10px] text-muted-foreground">
            ↳ {data.answers.length}
          </span>
        ) : null}
      </div>
      <div className="text-sm font-semibold leading-tight">{data.label}</div>
      {data.mapsFrom && data.mapsFrom.length > 0 ? (
        <div className="truncate font-mono text-[10px] text-muted-foreground">
          {data.mapsFrom.join(' · ')}
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-slate-400" />
    </div>
  )
}

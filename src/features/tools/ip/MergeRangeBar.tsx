import { parseLineToRange } from '../../../lib/calculations/routeSummary'

interface MergeRangeBarProps {
  inputs: string[]
  outputs: string[]
}

interface PositionedBlock {
  label: string
  leftPercent: number
  widthPercent: number
}

function toPositionedBlocks(labels: string[], minStart: number, span: number): PositionedBlock[] {
  return labels.flatMap((label) => {
    const range = parseLineToRange(label)
    if (!range) return []
    return [
      {
        label,
        leftPercent: ((range.start - minStart) / span) * 100,
        widthPercent: Math.max(((range.end - range.start + 1) / span) * 100, 0.5),
      },
    ]
  })
}

// A shared number line under each merge group -- input blocks on top,
// output block(s) below, both positioned on the same scale so the merge
// reads as an actual before/after on one line rather than two disconnected
// lists of CIDR strings. Scaled to this group's own span (not the whole
// address space), same rationale as RangeOverlapDiagram: a span covering
// most of a /8 would otherwise make a /30 output invisible.
export function MergeRangeBar({ inputs, outputs }: MergeRangeBarProps) {
  const allRanges = [...inputs, ...outputs].map(parseLineToRange).filter((r) => r !== null)
  if (allRanges.length === 0) return null

  const minStart = Math.min(...allRanges.map((r) => r.start))
  const maxEnd = Math.max(...allRanges.map((r) => r.end))
  const span = maxEnd - minStart + 1
  if (span <= 0) return null

  const inputBlocks = toPositionedBlocks(inputs, minStart, span)
  const outputBlocks = toPositionedBlocks(outputs, minStart, span)

  return (
    <div className="flex flex-col gap-1">
      <Row label="Before" blocks={inputBlocks} tone="bg-fg-subtle/25 border-fg-subtle/40" />
      <Row label="After" blocks={outputBlocks} tone="bg-accent/25 border-accent/50" />
    </div>
  )
}

function Row({ label, blocks, tone }: { label: string; blocks: PositionedBlock[]; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-[10px] text-fg-subtle">{label}</span>
      <div className="relative h-4 flex-1 rounded-sm bg-bg">
        {blocks.map((block, i) => (
          <div
            key={i}
            title={block.label}
            style={{ left: `${block.leftPercent}%`, width: `${block.widthPercent}%` }}
            className={`absolute top-0 h-full rounded-sm border ${tone}`}
          />
        ))}
      </div>
    </div>
  )
}

import { useDiagramExport } from '../../hooks/useDiagramExport'
import { ExportButton } from '../../components/ui/ExportButton'
import { Badge } from '../../components/ui/Badge'

interface DuelResultCardProps {
  leftLabel: string
  leftHost: string
  leftMs: number | null
  rightLabel: string
  rightHost: string
  rightMs: number | null
  winner: 'left' | 'right' | 'tie'
}

// Same html-to-image export pattern Challenge Mode's ChallengeResultCard
// already uses -- Labs' results were "look what I found" material with no
// way to actually show anyone until now.
export function DuelResultCard({
  leftLabel,
  leftHost,
  leftMs,
  rightLabel,
  rightHost,
  rightMs,
  winner,
}: DuelResultCardProps) {
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>('Ping pet duel result')

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Share this result</p>
        <ExportButton exportAs={exportAs} pending={pending} />
      </div>
      <div ref={ref} className="rounded-lg border border-border bg-bg p-6">
        <p className="text-center font-mono text-xs uppercase tracking-wide text-accent">
          PacketNova ping pet duel
        </p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-fg-subtle">{leftLabel}</p>
            <p className="font-mono text-2xl">
              {leftMs === null ? '--' : `${Math.round(leftMs)} ms`}
            </p>
            <p className="text-xs text-fg-subtle">{leftHost}</p>
            {winner === 'left' && <Badge tone="success">Winner</Badge>}
          </div>
          <p className="text-sm text-fg-subtle">vs</p>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-fg-subtle">{rightLabel}</p>
            <p className="font-mono text-2xl">
              {rightMs === null ? '--' : `${Math.round(rightMs)} ms`}
            </p>
            <p className="text-xs text-fg-subtle">{rightHost}</p>
            {winner === 'right' && <Badge tone="success">Winner</Badge>}
          </div>
        </div>
        {winner === 'tie' && <p className="mt-3 text-center text-sm text-fg-muted">It's a tie!</p>}
        <p className="mt-4 text-center font-mono text-xs text-fg-subtle">packetnova.ca</p>
      </div>
    </div>
  )
}

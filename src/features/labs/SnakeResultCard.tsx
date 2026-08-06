import { useDiagramExport } from '../../hooks/useDiagramExport'
import { ExportButton } from '../../components/ui/ExportButton'

interface SnakeResultCardProps {
  score: number
}

// Same html-to-image export pattern Challenge Mode's ChallengeResultCard
// already uses -- Labs' results were "look what I found" material with no
// way to actually show anyone until now.
export function SnakeResultCard({ score }: SnakeResultCardProps) {
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>('Packet snake result')

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Share this result</p>
        <ExportButton exportAs={exportAs} pending={pending} />
      </div>
      <div ref={ref} className="rounded-lg border border-border bg-bg p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">
          PacketNova packet snake
        </p>
        <p className="mt-3 font-mono text-3xl">{score}</p>
        <p className="text-xs text-fg-subtle">packets routed</p>
        <p className="mt-4 font-mono text-xs text-fg-subtle">packetnova.ca</p>
      </div>
    </div>
  )
}

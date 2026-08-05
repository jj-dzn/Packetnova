import { useDiagramExport } from '../../hooks/useDiagramExport'
import { ExportButton } from '../../components/ui/ExportButton'
import { Badge } from '../../components/ui/Badge'
import { formatElapsedTime, gradeForWrongTurns } from '../../lib/scenarios/branchingScoring'

interface ChallengeResultCardProps {
  scenarioTitle: string
  elapsedMs: number
  wrongTurns: number
}

// Reuses the same html-to-image export pattern every visualizer/diagram on
// the site already uses (useDiagramExport + ExportButton) rather than
// hand-drawing a canvas -- the card is plain styled HTML, "shareable
// image" just means rasterizing it, exactly like every other export button
// on the site already does.
export function ChallengeResultCard({
  scenarioTitle,
  elapsedMs,
  wrongTurns,
}: ChallengeResultCardProps) {
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>(`${scenarioTitle} result`)
  const grade = gradeForWrongTurns(wrongTurns)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Your result</p>
        <ExportButton exportAs={exportAs} pending={pending} />
      </div>
      <div ref={ref} className="rounded-lg border border-border bg-bg p-6">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">
          PacketNova challenge
        </p>
        <h3 className="mt-2 text-lg font-semibold">{scenarioTitle}</h3>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="font-mono text-2xl">{formatElapsedTime(elapsedMs)}</p>
            <p className="text-xs text-fg-subtle">time</p>
          </div>
          <div>
            <p className="font-mono text-2xl">{wrongTurns}</p>
            <p className="text-xs text-fg-subtle">wrong turn{wrongTurns === 1 ? '' : 's'}</p>
          </div>
          <Badge tone={grade.tone}>{grade.label}</Badge>
        </div>
        <p className="mt-4 font-mono text-xs text-fg-subtle">packetnova.ca</p>
      </div>
    </div>
  )
}

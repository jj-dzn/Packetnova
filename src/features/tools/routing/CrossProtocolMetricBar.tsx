interface MetricBarRow {
  label: string
  value: number
  unit: string
}

interface CrossProtocolMetricBarProps {
  rows: MetricBarRow[]
}

const TINTS = ['bg-accent', 'bg-accent-alt', 'bg-warning']

// Deliberately a log-scale bar, not linear -- these three numbers span
// several orders of magnitude for the exact same physical link (a hop
// count of 1 next to an EIGRP composite metric in the tens of thousands),
// so a linear bar would render two of the three as invisible slivers. The
// log scale keeps all three legible at once, which is itself the point:
// wildly different bar lengths for the same link is the visual proof that
// these numbers were never meant to be compared directly.
export function CrossProtocolMetricBar({ rows }: CrossProtocolMetricBarProps) {
  const logValues = rows.map((row) => Math.log10(row.value + 1))
  const maxLog = Math.max(...logValues, 1)

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => {
        const widthPercent = Math.max((logValues[i]! / maxLog) * 100, 3)
        return (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-fg-muted">{row.label}</span>
            <div className="h-4 flex-1 overflow-hidden rounded-sm bg-bg">
              <div
                style={{ width: `${widthPercent}%` }}
                className={`h-full rounded-sm ${TINTS[i % TINTS.length]}`}
              />
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-xs text-fg-muted">
              {row.value.toLocaleString()} {row.unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}

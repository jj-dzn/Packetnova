import { computeCharDiff } from '../../lib/calculations/textDiff'

interface CharDiffViewProps {
  before: string
  after: string
}

// Character-level highlighting of exactly what an encode/decode operation
// changed -- reuses Text Diff Viewer's same added/removed color treatment
// (bg-success for added, bg-danger + strikethrough for removed), just at
// diffChars granularity instead of diffLines, since here "before" and
// "after" are a transformation of one string rather than two independently
// edited texts.
export function CharDiffView({ before, after }: CharDiffViewProps) {
  const calc = computeCharDiff(before, after)
  if (!calc.ok) return null

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-fg-muted">What changed</p>
      <p className="whitespace-pre-wrap break-all rounded-md border border-border bg-bg p-3 font-mono text-xs">
        {calc.result.map((part, i) => {
          if (!part.added && !part.removed) return <span key={i}>{part.value}</span>
          return (
            <span
              key={i}
              className={
                part.added ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger line-through'
              }
            >
              {part.value}
            </span>
          )
        })}
      </p>
    </div>
  )
}

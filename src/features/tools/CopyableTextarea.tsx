import { CopyButton } from '../../components/ui/CopyButton'

interface CopyableTextareaProps {
  value: string
  rows?: number
  label?: string
}

// A read-only output textarea with a copy button overlaid in the corner --
// the shape every formatter/encoder tool's result shares.
export function CopyableTextarea({ value, rows = 6, label = 'output' }: CopyableTextareaProps) {
  return (
    <div className="relative">
      <textarea
        readOnly
        value={value}
        rows={rows}
        className="w-full rounded-md border border-border bg-bg px-3 py-2 pr-9 font-mono text-sm text-fg"
      />
      <CopyButton value={value} label={label} className="absolute right-2 top-2 bg-surface" />
    </div>
  )
}

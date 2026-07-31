import { CopyButton } from '../../components/ui/CopyButton'

interface ResultRowProps {
  label: string
  value: string
}

export function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-1.5">
        <span className="min-w-0 break-all text-right font-mono text-sm">{value}</span>
        <CopyButton value={value} label={label} />
      </dd>
    </div>
  )
}

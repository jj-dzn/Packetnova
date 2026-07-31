interface ResultRowProps {
  label: string
  value: string
}

export function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="min-w-0 break-all text-right font-mono text-sm">{value}</dd>
    </div>
  )
}

import { CopyButton } from '../../components/ui/CopyButton'
import { Skeleton } from '../../components/ui/Skeleton'

interface ResultRowProps {
  label: string
  value: string
  /** Shows a pulsing placeholder instead of value/copy button -- for rows
   * backed by genuinely async work (e.g. crypto.subtle.digest), not
   * synchronous calculations that never have a pending state to show. */
  loading?: boolean
}

export function ResultRow({ label, value, loading = false }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-fg-muted">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-1.5">
        {loading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <>
            <span className="min-w-0 break-words text-right font-mono text-sm">{value}</span>
            <CopyButton value={value} label={label} />
          </>
        )}
      </dd>
    </div>
  )
}

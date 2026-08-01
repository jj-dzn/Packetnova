import type { ReactNode } from 'react'

export interface NatTableRow {
  id: string | number
  privateAddr: string
  publicAddr: string
}

interface NatTableDiagramProps {
  rows: NatTableRow[]
  emptyLabel?: ReactNode
  leftHeader?: string
  rightHeader?: string
  /** Compact sizing with no border/header-bg, for embedding inside a small
   * flow-diagram box rather than standing alone as a full-width table. */
  dense?: boolean
  showHeader?: boolean
}

// Shared "private:port <-> public:port" mapping table. Backs both a single
// highlighted-row case (NatFlowVisualizer's static-mode NAT box, previously
// a plain text string) and a growing multi-row case (PAT/NAT overload,
// previously its own bespoke <table>) -- the two had already independently
// converged on the same private-arrow-public shape before this existed.
export function NatTableDiagram({
  rows,
  emptyLabel = 'No mappings yet',
  leftHeader = 'Private',
  rightHeader = 'Public',
  dense = false,
  showHeader = true,
}: NatTableDiagramProps) {
  const pad = dense ? 'px-1.5 py-1' : 'px-3 py-2'
  const textSize = dense ? 'text-[11px]' : 'text-sm'

  if (rows.length === 0) {
    return (
      <p className={`font-mono ${dense ? 'text-[11px]' : 'text-xs'} text-fg-subtle`}>
        {emptyLabel}
      </p>
    )
  }

  const table = (
    <table className={`w-full text-left ${textSize}`}>
      {showHeader && (
        <thead className={dense ? undefined : 'bg-surface'}>
          <tr className="border-b border-border">
            <th className={`${pad} font-medium text-fg-muted`}>{leftHeader}</th>
            <th className={pad}></th>
            <th className={`${pad} font-medium text-fg-muted`}>{rightHeader}</th>
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-border font-mono last:border-b-0">
            <td className={pad}>{row.privateAddr}</td>
            <td className={`${pad} text-fg-subtle`}>&rarr;</td>
            <td className={`${pad} text-accent`}>{row.publicAddr}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return dense ? (
    table
  ) : (
    <div className="overflow-hidden rounded-md border border-border">{table}</div>
  )
}

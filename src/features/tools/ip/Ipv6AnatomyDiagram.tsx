import { useDiagramExport } from '../../../hooks/useDiagramExport'
import { ExportButton } from '../../../components/ui/ExportButton'

interface AnatomySegment {
  label: string
  hexChars: string
  bits: number
}

interface Ipv6AnatomyDiagramProps {
  segments: AnatomySegment[]
}

const TINTS = ['bg-accent/10 border-accent/30', 'bg-accent-alt/10 border-accent-alt/30']

// The address split into its semantic parts -- global routing prefix,
// subnet ID, interface ID -- rather than just the flat hextet-by-hextet
// view above it. Boundaries are rounded to the nearest nibble (4 bits):
// virtually every real IPv6 allocation is nibble-aligned already (RIRs
// hand out /32s, /48s; sites subnet to /56s, /60s, /64s), so this is exact
// for the cases that matter and only approximate for the rare
// non-nibble-aligned prefix length.
export function Ipv6AnatomyDiagram({ segments }: Ipv6AnatomyDiagramProps) {
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>('ipv6-anatomy')

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-fg-muted">Anatomy of this address</p>
        <ExportButton exportAs={exportAs} pending={pending} />
      </div>
      <div ref={ref} className="mt-1.5 flex h-16 overflow-hidden rounded-md border border-border">
        {segments.map((segment, index) =>
          segment.bits > 0 ? (
            <div
              key={segment.label}
              style={{ flexGrow: segment.bits, flexBasis: 0 }}
              className={`flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden border-r px-1 text-center last:border-r-0 ${TINTS[index % TINTS.length]}`}
              title={`${segment.label} -- ${segment.bits} bits`}
            >
              <span className="block max-w-full truncate text-[10px] font-medium">
                {segment.label}
              </span>
              <span className="block max-w-full truncate font-mono text-[10px] text-fg-subtle">
                {segment.hexChars || '(empty)'}
              </span>
              <span className="block max-w-full truncate text-[9px] text-fg-subtle">
                {segment.bits} bits
              </span>
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}

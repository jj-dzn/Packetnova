import { networkAddress, broadcastAddress, parseCIDR, parseIPv4 } from '../../lib/validation/ip'
import { useDiagramExport } from '../../hooks/useDiagramExport'
import { ExportButton } from '../../components/ui/ExportButton'

export interface OverlapRoute {
  cidr: string
  label: string
  prefixLength: number
  matches: boolean
  isWinner: boolean
}

interface RangeOverlapDiagramProps {
  routes: OverlapRoute[]
  destinationIp: string
}

// Each row is scaled to its OWN range (0% = that route's network address,
// 100% = its broadcast address), not a single shared address-space axis --
// a shared linear scale would make a /24 an invisible sliver next to a /0
// default route. This isn't proportional across rows, but it's honest
// about what it shows (where does the destination fall within *this*
// route's range) and stays readable no matter how wildly the candidate
// routes' sizes vary, which real routing tables often do.
export function RangeOverlapDiagram({ routes, destinationIp }: RangeOverlapDiagramProps) {
  const destination = parseIPv4(destinationIp)
  const { ref, exportAs, pending } = useDiagramExport<HTMLDivElement>('range-overlap')
  if (!destination) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-fg-muted">
          Where {destinationIp} falls within each candidate range
        </p>
        <ExportButton exportAs={exportAs} pending={pending} />
      </div>
      <div ref={ref} className="flex flex-col gap-2">
        {routes.map((route) => {
          const parsed = parseCIDR(route.cidr)
          if (!parsed) return null
          const networkValue = networkAddress(parsed.ip, parsed.prefixLength).value
          const broadcastValue = broadcastAddress(parsed.ip, parsed.prefixLength).value
          const span = broadcastValue - networkValue
          const percent =
            span > 0 ? ((destination.value - networkValue) / span) * 100 : route.matches ? 50 : 0

          return (
            <div key={`${route.cidr}-${route.label}`} className="flex items-center gap-2">
              <span
                className={`w-28 shrink-0 truncate font-mono text-[11px] ${
                  route.isWinner ? 'text-accent' : route.matches ? 'text-fg' : 'text-fg-subtle'
                }`}
                title={route.label}
              >
                {route.label}
              </span>
              <div
                className={`relative h-5 flex-1 overflow-hidden rounded-sm border ${
                  route.isWinner
                    ? 'border-accent bg-accent/15'
                    : route.matches
                      ? 'border-border bg-fg-subtle/10'
                      : 'border-border bg-bg opacity-40'
                }`}
                title={`${route.cidr} -- ${route.matches ? 'contains' : 'does not contain'} ${destinationIp}`}
              >
                {route.matches && (
                  <div
                    aria-hidden="true"
                    className={`absolute top-0 h-full w-0.5 -translate-x-1/2 ${
                      route.isWinner
                        ? 'bg-accent shadow-[0_0_6px_1px_var(--color-accent)]'
                        : 'bg-fg'
                    }`}
                    style={{ left: `${Math.min(100, Math.max(0, percent))}%` }}
                  />
                )}
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-[10px] text-fg-subtle">
                /{route.prefixLength}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

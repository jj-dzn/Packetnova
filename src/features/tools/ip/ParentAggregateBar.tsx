import { calculateCidr } from '../../../lib/calculations/cidr'
import { parseIPv4 } from '../../../lib/validation/ip'

interface ParentAggregateBarProps {
  /** The currently-computed block, e.g. "192.168.1.0/24". */
  cidr: string
}

// A block's immediate parent aggregate is always exactly one bit less
// specific, which means there are always exactly two equal-sized children
// -- this block is either the lower or upper half, never anything more
// complicated. Showing that concretely (not just "here's your /24") is
// what makes supernetting/summarization click: the CIDR calculator's
// bit-toggle sandbox already lets you flip a bit and watch this update, so
// toggling the boundary bit between the two halves is a visible
// demonstration of exactly what changed.
export function ParentAggregateBar({ cidr }: ParentAggregateBarProps) {
  const [, prefixString] = cidr.split('/')
  const prefixLength = Number(prefixString)
  if (!Number.isFinite(prefixLength) || prefixLength < 1) return null

  const childCalc = calculateCidr(cidr)
  if (!childCalc.ok) return null

  // The child's network address masked down to the parent's shorter prefix
  // isn't necessarily already parent-network-aligned (e.g. 192.168.1.0/24's
  // /23 parent is 192.168.0.0/23, not 192.168.1.0/23) -- calculateCidr does
  // that masking, so the parent's own networkAddress from its result, not
  // the string passed in, is the one safe to display.
  const parentCalc = calculateCidr(`${childCalc.result.networkAddress}/${prefixLength - 1}`)
  if (!parentCalc.ok) return null
  const parentCidr = `${parentCalc.result.networkAddress}/${prefixLength - 1}`

  const parentNetworkValue = parseIPv4(parentCalc.result.networkAddress)?.value
  const parentBroadcastValue = parseIPv4(parentCalc.result.broadcastAddress)?.value
  const childNetworkValue = parseIPv4(childCalc.result.networkAddress)?.value
  const childBroadcastValue = parseIPv4(childCalc.result.broadcastAddress)?.value
  if (
    parentNetworkValue === undefined ||
    parentBroadcastValue === undefined ||
    childNetworkValue === undefined ||
    childBroadcastValue === undefined
  ) {
    return null
  }

  const span = parentBroadcastValue - parentNetworkValue + 1
  const leftPercent = ((childNetworkValue - parentNetworkValue) / span) * 100
  const widthPercent = ((childBroadcastValue - childNetworkValue + 1) / span) * 100
  const isLowerHalf = leftPercent < 50

  return (
    <div>
      <p className="text-xs font-medium text-fg-muted">
        Position within parent aggregate {parentCidr}
      </p>
      <div className="relative mt-1 h-8 overflow-hidden rounded-md border border-border bg-fg-subtle/5">
        <div
          className="absolute top-0 h-full border-x border-accent bg-accent/25 transition-all duration-300 ease-out"
          style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
          title={`${cidr} -- this block`}
        />
        <div className="relative flex h-full items-center justify-center font-mono text-[11px] text-fg-subtle">
          {parentCidr}
        </div>
      </div>
      <p className="mt-1 text-xs text-fg-subtle">
        This /{prefixLength} is the{' '}
        <span className="text-accent">{isLowerHalf ? 'lower' : 'upper'}</span> half of the /
        {prefixLength - 1} above it -- the other half is{' '}
        {isLowerHalf ? 'the next block up' : 'the block below it'}.
      </p>
    </div>
  )
}

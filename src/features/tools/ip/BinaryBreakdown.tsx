import { ipv4ToBinaryOctets } from '../../../lib/formatting/binary'

interface BinaryBreakdownProps {
  label: string
  value: number
  /** When set, bits before this index are styled as "network" bits, the rest as "host" bits. */
  prefixLength?: number
}

// Octet-by-octet binary rendering of an IPv4 value, with the network/host
// boundary highlighted when a prefix length is given -- this is usually
// the thing that makes subnetting actually click for someone learning it,
// and none of the IP tools showed it before.
export function BinaryBreakdown({ label, value, prefixLength }: BinaryBreakdownProps) {
  const octets = ipv4ToBinaryOctets(value)

  return (
    <div>
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <p className="mt-1 flex flex-wrap gap-x-2 font-mono text-sm">
        {octets.map((octet, octetIndex) => (
          <span key={octetIndex}>
            {octet.split('').map((bit, bitIndex) => {
              const globalBitIndex = octetIndex * 8 + bitIndex
              const isNetworkBit = prefixLength !== undefined && globalBitIndex < prefixLength
              return (
                <span key={bitIndex} className={isNetworkBit ? 'text-accent' : 'text-fg-subtle'}>
                  {bit}
                </span>
              )
            })}
          </span>
        ))}
      </p>
      {prefixLength !== undefined && (
        <p className="mt-1 text-xs text-fg-subtle">
          <span className="text-accent">network bits</span> / host bits
        </p>
      )}
    </div>
  )
}

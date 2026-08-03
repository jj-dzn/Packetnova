import { useEffect, useState } from 'react'
import { ipv4ToBinaryOctets } from '../../../lib/formatting/binary'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'

interface BroadcastBitFlipProps {
  label: string
  inputValue: number
  broadcastValue: number
  prefixLength: number
}

const FLIP_DELAY_MS = 300

// Same octet-by-octet binary rendering as BinaryBreakdown, but starting
// from the address actually typed in and animating the host bits over to
// all 1s -- makes concrete which bits "broadcast" actually changes,
// instead of just showing the already-computed result.
export function BroadcastBitFlip({
  label,
  inputValue,
  broadcastValue,
  prefixLength,
}: BroadcastBitFlipProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  // Remounted via a `key` on the parent tied to the same inputs, so the
  // initial value below is a fresh start every time those inputs change
  // rather than something this effect needs to reset by hand. Under
  // reduced motion, skip straight to the flipped (final) state instead of
  // delaying and flashing into it.
  const [flipped, setFlipped] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setTimeout(() => setFlipped(true), FLIP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [prefersReducedMotion])

  const inputOctets = ipv4ToBinaryOctets(inputValue)
  const broadcastOctets = ipv4ToBinaryOctets(broadcastValue)

  return (
    <div>
      <p className="text-xs font-medium text-fg-muted">{label}</p>
      <p className="mt-1 flex flex-wrap gap-x-2 font-mono text-sm">
        {broadcastOctets.map((octet, octetIndex) => (
          <span key={octetIndex}>
            {octet.split('').map((broadcastBit, bitIndex) => {
              const globalBitIndex = octetIndex * 8 + bitIndex
              const isNetworkBit = globalBitIndex < prefixLength
              const inputBit = inputOctets[octetIndex]![bitIndex]
              const displayedBit = isNetworkBit || flipped ? broadcastBit : inputBit
              const isChangingBit = !isNetworkBit && inputBit !== broadcastBit
              return (
                <span
                  key={bitIndex}
                  className={`${isNetworkBit ? 'text-accent' : 'text-fg-subtle'} ${
                    isChangingBit && flipped ? 'motion-safe:animate-pn-avalanche-flash' : ''
                  }`}
                >
                  {displayedBit}
                </span>
              )
            })}
          </span>
        ))}
      </p>
      <p className="mt-1 text-xs text-fg-subtle">
        <span className="text-accent">network bits</span> / host bits, flipping to all 1s
      </p>
    </div>
  )
}

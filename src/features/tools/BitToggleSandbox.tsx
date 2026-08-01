interface BitToggleSandboxProps {
  /** Unsigned 32-bit value. */
  value: number
  onToggle: (bitIndex: number) => void
  /** How many bits to cluster into each visual group, MSB-first. */
  groupSize?: number
  /** When set, bits before this index (from the MSB) are styled as
   * "network" bits, the rest as "host" bits -- for IPv4 tools. */
  prefixLength?: number
}

const BIT_COUNT = 32

// Interactive counterpart to BinaryBreakdown: every bit is a button, so
// toggling one and watching every dependent value recompute is the whole
// point, instead of just reading a static breakdown.
export function BitToggleSandbox({
  value,
  onToggle,
  groupSize = 8,
  prefixLength,
}: BitToggleSandboxProps) {
  const groups: number[][] = []
  for (let i = 0; i < BIT_COUNT; i += groupSize) {
    groups.push(Array.from({ length: groupSize }, (_, j) => i + j))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex gap-0.5">
            {group.map((bitIndex) => {
              const bitValue = (value >>> (BIT_COUNT - 1 - bitIndex)) & 1
              const isNetworkBit = prefixLength !== undefined && bitIndex < prefixLength
              return (
                <button
                  key={bitIndex}
                  type="button"
                  onClick={() => onToggle(bitIndex)}
                  aria-label={`Bit ${bitIndex}, currently ${bitValue}, click to toggle`}
                  className={`flex h-7 w-6 items-center justify-center rounded-sm border font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    bitValue
                      ? isNetworkBit
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-accent-alt bg-accent-alt/20 text-accent-alt'
                      : 'border-border bg-bg text-fg-subtle hover:border-accent/40'
                  }`}
                >
                  {bitValue}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-fg-subtle">Click any bit to toggle it.</p>
    </div>
  )
}

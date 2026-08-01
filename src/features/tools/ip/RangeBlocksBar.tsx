import type { CidrBlock } from '../../../lib/calculations/ipRange'

interface RangeBlocksBarProps {
  blocks: CidrBlock[]
}

const TINTS = ['bg-accent/15 text-accent', 'bg-accent-alt/15 text-accent-alt']

// Each block's width is proportional to how many addresses it covers, so a
// range that decomposes into one huge block plus a few small leftover ones
// reads at a glance as "mostly one block, plus scraps" -- the same shape
// VLSM's efficiency callout gives for host allocation, applied here to CIDR
// decomposition instead.
export function RangeBlocksBar({ blocks }: RangeBlocksBarProps) {
  return (
    <div className="flex h-10 overflow-hidden rounded-md border border-border font-mono text-[11px]">
      {blocks.map((block, index) => {
        const size = 2 ** (32 - block.prefixLength)
        return (
          <div
            key={block.cidr}
            style={{ flexGrow: size, flexBasis: 0, minWidth: 6 }}
            className={`flex min-w-0 items-center justify-center overflow-hidden border-r border-border px-1 text-center last:border-r-0 ${TINTS[index % TINTS.length]}`}
            title={`${block.cidr} -- ${size.toLocaleString()} address${size === 1 ? '' : 'es'}`}
          >
            <span className="truncate">{block.cidr}</span>
          </div>
        )
      })}
    </div>
  )
}

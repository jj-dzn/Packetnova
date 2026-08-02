export interface FrameSegment {
  label: string
  bytes: number
  detail?: string
  highlighted?: boolean
}

interface FrameFieldStripProps {
  segments: FrameSegment[]
}

// A single flowing row of byte-proportional boxes -- unlike
// HeaderByteDiagram, not wrapped into 32-bit rows, since a link-layer
// frame's fields (6-byte MAC addresses, a 4-byte 802.1Q tag) don't pack
// into 32-bit words the way TCP/UDP/IP headers were designed to. Built for
// showing a field "in context" of the whole frame it lives inside, not as
// a byte-by-byte reference in its own right.
export function FrameFieldStrip({ segments }: FrameFieldStripProps) {
  const totalBytes = segments.reduce((sum, segment) => sum + segment.bytes, 0)

  return (
    <div>
      <div className="flex h-14 overflow-hidden rounded-md border border-border">
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{ flexGrow: segment.bytes, flexBasis: 0 }}
            className={`flex min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden border-r border-border px-1 text-center last:border-r-0 ${
              segment.highlighted ? 'bg-accent/25' : 'bg-accent-alt/10'
            }`}
            title={`${segment.label} -- ${segment.bytes} byte${segment.bytes === 1 ? '' : 's'}${segment.detail ? ` -- ${segment.detail}` : ''}`}
          >
            <span
              className={`block max-w-full truncate text-[10px] font-medium ${segment.highlighted ? 'text-accent' : ''}`}
            >
              {segment.label}
            </span>
            <span className="block max-w-full truncate font-mono text-[9px] text-fg-subtle">
              {segment.bytes}B
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-right font-mono text-[10px] text-fg-subtle">
        {totalBytes} bytes shown
      </p>
    </div>
  )
}

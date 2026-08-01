interface MacBinaryBreakdownProps {
  bytes: number[]
}

// Same visual language as IP tools' BinaryBreakdown (ip/BinaryBreakdown.tsx)
// -- byte-by-byte binary, first N bytes highlighted -- just applied to a
// MAC's 6 bytes instead of IPv4's 4, with the OUI/NIC-specific split
// standing in for network/host bits (MAC addresses have no such boundary
// of their own).
export function MacBinaryBreakdown({ bytes }: MacBinaryBreakdownProps) {
  return (
    <div>
      <p className="text-xs font-medium text-fg-muted">Binary, byte by byte</p>
      <p className="mt-1 flex flex-wrap gap-x-2 font-mono text-sm">
        {bytes.map((byte, index) => (
          <span key={index} className={index < 3 ? 'text-accent' : 'text-fg-subtle'}>
            {byte.toString(2).padStart(8, '0')}
          </span>
        ))}
      </p>
      <p className="mt-1 text-xs text-fg-subtle">
        <span className="text-accent">OUI (vendor)</span> / NIC-specific
      </p>
    </div>
  )
}

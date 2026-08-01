interface AddressSpaceBarProps {
  networkAddress: string
  broadcastAddress: string
  firstUsable: string | null
  lastUsable: string | null
  usableHosts: number
}

// A single network's address range as a bar: network address and broadcast
// address as end caps (when they're actually excluded from use), usable
// hosts as the middle segment. Deliberately not scaled to the full 32-bit
// address space -- for anything smaller than a very large block, a
// literally-proportional sliver against 2^32 would be too small to see or
// read, so this instead visualizes the one relationship that's always
// meaningful regardless of prefix length: how much of this block is
// endpoints vs. assignable to a host.
export function AddressSpaceBar({
  networkAddress,
  broadcastAddress,
  firstUsable,
  lastUsable,
  usableHosts,
}: AddressSpaceBarProps) {
  if (firstUsable === null) {
    return (
      <div className="flex h-10 items-center justify-center overflow-hidden rounded-md border border-border bg-accent/15 px-2 text-center font-mono text-[11px] text-accent">
        {networkAddress} -- single host (/32)
      </div>
    )
  }

  const showNetworkCap = firstUsable !== networkAddress
  const showBroadcastCap = lastUsable !== broadcastAddress

  return (
    <div className="flex h-10 overflow-hidden rounded-md border border-border font-mono text-[11px]">
      {showNetworkCap && (
        <div
          className="flex w-24 shrink-0 items-center justify-center truncate border-r border-border bg-fg-subtle/10 px-1 text-fg-muted"
          title={`Network address: ${networkAddress} (not assignable to a host)`}
        >
          {networkAddress}
        </div>
      )}
      <div
        className="flex min-w-0 flex-1 items-center justify-center truncate bg-accent/15 px-1 text-accent"
        title={`Usable range: ${firstUsable} - ${lastUsable}`}
      >
        {usableHosts.toLocaleString()} usable host{usableHosts === 1 ? '' : 's'}
      </div>
      {showBroadcastCap && (
        <div
          className="flex w-24 shrink-0 items-center justify-center truncate border-l border-border bg-fg-subtle/10 px-1 text-fg-muted"
          title={`Broadcast address: ${broadcastAddress} (not assignable to a host)`}
        >
          {broadcastAddress}
        </div>
      )}
    </div>
  )
}

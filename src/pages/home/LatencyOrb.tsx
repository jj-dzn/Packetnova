// Purely decorative "live" indicator -- pulses once a second. Not a real
// measurement (that's what the Labs ping pet is for); this is atmosphere.
export function LatencyOrb() {
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full rounded-full bg-accent-alt motion-safe:animate-pn-orb-pulse" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-alt" />
    </span>
  )
}

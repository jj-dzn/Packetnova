import { useMascotMood } from '../../hooks/useMascotMood'
import type { MascotMood } from '../../components/ui/Mascot'

const MOOD_COLOR_CLASS: Record<MascotMood, string> = {
  idle: 'bg-accent-alt',
  checking: 'bg-accent',
  fast: 'bg-success',
  medium: 'bg-accent-alt',
  slow: 'bg-warning',
  error: 'bg-danger',
}

// Purely decorative "live" indicator -- pulses once a second, and now
// echoes the sitewide mascot mood (Nav.tsx) rather than a fixed color:
// this dot is mounted in both the hero and the footer, so a visitor who
// gets an error or a fresh result anywhere on the site sees the same
// signal reflected in the one piece of ambient "signal" chrome every page
// shares, not just in the nav mascot itself. Still not a real measurement
// -- that's what the Labs ping pet is for; this stays atmosphere.
export function LatencyOrb() {
  const mood = useMascotMood()
  const colorClass = MOOD_COLOR_CLASS[mood]

  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${colorClass} transition-colors duration-300 motion-safe:animate-pn-orb-pulse`}
      />
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${colorClass} transition-colors duration-300`}
      />
    </span>
  )
}

// PacketNova's mascot -- promoted from the Ping Pet creature that used to
// live only in `features/labs/PingPetCreature.tsx`. The construction (a
// small glowing-antenna SVG creature whose fill/motion/face react to a
// `mood`) didn't need to change to become sitewide; only its meaning did.
// `PingPetCreature` now wraps this component for backward compatibility --
// its own `status` prop (latency-specific naming) is a type alias for
// `MascotMood`, so every existing caller keeps working unchanged.
//
// The six moods already cover "how's it going" for any context, not just
// ping latency: idle (nothing happening yet), checking (in progress),
// fast (great outcome), medium (fine outcome), slow (works, but not
// great), error (something's wrong). To give the mascot a new reaction
// somewhere new, don't add a new mood -- pick the closest existing one
// (e.g. a calculator's valid result -> "fast", invalid input -> "error",
// still computing -> "checking") and pass it in. That's the whole
// extension pattern.
export type MascotMood = 'idle' | 'checking' | 'fast' | 'medium' | 'slow' | 'error'

const BODY_FILL: Record<MascotMood, string> = {
  idle: 'fill-fg-subtle',
  checking: 'fill-accent',
  fast: 'fill-success',
  medium: 'fill-accent',
  slow: 'fill-warning',
  error: 'fill-danger',
}

const BODY_MOTION: Record<MascotMood, string> = {
  idle: 'motion-safe:animate-[pn-pet-idle_3s_ease-in-out_infinite]',
  checking: 'motion-safe:animate-pulse',
  fast: 'motion-safe:animate-bounce',
  medium: 'motion-safe:animate-[pn-pet-idle_3s_ease-in-out_infinite]',
  slow: 'motion-safe:animate-[pn-pet-idle_5s_ease-in-out_infinite]',
  error: '',
}

interface MascotProps {
  mood: MascotMood
  className?: string
  /** Accessible name -- describe what this specific placement means, e.g.
   * "PacketNova, idle" in the nav or "Ping pet, currently fast" in Labs. */
  label?: string
}

export function Mascot({
  mood,
  className = 'h-32 w-32',
  label = `PacketNova, ${mood}`,
}: MascotProps) {
  const isError = mood === 'error'
  const isSlow = mood === 'slow'

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} ${BODY_MOTION[mood]}`}
      role="img"
      aria-label={label}
    >
      <line
        x1="60"
        y1="38"
        x2="60"
        y2={isSlow ? 26 : 20}
        stroke="currentColor"
        className="text-fg-subtle"
        strokeWidth="2"
      />
      <circle cx="60" cy={isSlow ? 24 : 18} r="4" className={BODY_FILL[mood]} />

      <ellipse
        cx="60"
        cy={isSlow ? 74 : 70}
        rx="38"
        ry={isSlow ? 28 : 32}
        className={BODY_FILL[mood]}
        opacity="0.9"
      />

      {isError ? (
        <>
          <path
            d="M40 60L52 72M52 60L40 72"
            stroke="var(--color-bg)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M68 60L80 72M80 60L68 72"
            stroke="var(--color-bg)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="46" cy={isSlow ? 68 : 64} r="5" fill="var(--color-bg)" />
          <circle cx="74" cy={isSlow ? 68 : 64} r="5" fill="var(--color-bg)" />
        </>
      )}

      {isError ? (
        <path
          d="M50 86Q60 80 70 86"
          stroke="var(--color-bg)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d={isSlow ? 'M50 86Q60 88 70 86' : 'M48 84Q60 96 72 84'}
          stroke="var(--color-bg)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

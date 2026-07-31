export type PetStatus = 'idle' | 'checking' | 'fast' | 'medium' | 'slow' | 'error'

const BODY_FILL: Record<PetStatus, string> = {
  idle: 'fill-fg-subtle',
  checking: 'fill-accent',
  fast: 'fill-success',
  medium: 'fill-accent',
  slow: 'fill-warning',
  error: 'fill-danger',
}

const BODY_MOTION: Record<PetStatus, string> = {
  idle: 'motion-safe:animate-[pn-pet-idle_3s_ease-in-out_infinite]',
  checking: 'motion-safe:animate-pulse',
  fast: 'motion-safe:animate-bounce',
  medium: 'motion-safe:animate-[pn-pet-idle_3s_ease-in-out_infinite]',
  slow: 'motion-safe:animate-[pn-pet-idle_5s_ease-in-out_infinite]',
  error: '',
}

interface PingPetCreatureProps {
  status: PetStatus
  className?: string
}

export function PingPetCreature({ status, className = 'h-32 w-32' }: PingPetCreatureProps) {
  const isError = status === 'error'
  const isSlow = status === 'slow'

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} ${BODY_MOTION[status]}`}
      role="img"
      aria-label={`Ping pet, currently ${status}`}
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
      <circle cx="60" cy={isSlow ? 24 : 18} r="4" className={BODY_FILL[status]} />

      <ellipse
        cx="60"
        cy={isSlow ? 74 : 70}
        rx="38"
        ry={isSlow ? 28 : 32}
        className={BODY_FILL[status]}
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

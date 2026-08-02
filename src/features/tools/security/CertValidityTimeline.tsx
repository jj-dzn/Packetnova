interface CertValidityTimelineProps {
  notBefore: Date
  notAfter: Date
  now?: Date
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// A validity-lifetime bar -- not-before to not-after, with "today" marked
// wherever it actually falls (before, inside, or past the range) -- so a
// certificate's remaining lifetime reads as a position on a timeline
// instead of two dates a visitor has to mentally subtract themselves.
export function CertValidityTimeline({
  notBefore,
  notAfter,
  now = new Date(),
}: CertValidityTimelineProps) {
  const totalMs = notAfter.getTime() - notBefore.getTime()
  const elapsedMs = now.getTime() - notBefore.getTime()
  const clampedFraction = Math.min(1, Math.max(0, totalMs > 0 ? elapsedMs / totalMs : 0))
  const isExpired = now > notAfter
  const isNotYetValid = now < notBefore
  const remainingDays = Math.ceil((notAfter.getTime() - now.getTime()) / MS_PER_DAY)

  const barTone = isExpired
    ? 'bg-danger'
    : isNotYetValid
      ? 'bg-warning'
      : remainingDays <= 30
        ? 'bg-warning'
        : 'bg-success'

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-fg-subtle">
        <span>{notBefore.toLocaleDateString()}</span>
        <span className="font-medium text-fg">
          {isExpired
            ? `Expired ${Math.abs(remainingDays).toLocaleString()} days ago`
            : isNotYetValid
              ? 'Not yet valid'
              : `${remainingDays.toLocaleString()} days remaining`}
        </span>
        <span>{notAfter.toLocaleDateString()}</span>
      </div>
      <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-[width] ${barTone}`}
          style={{ width: `${(isNotYetValid ? 0 : clampedFraction) * 100}%` }}
        />
        {!isNotYetValid && !isExpired && (
          <div
            className="absolute top-0 h-full w-0.5 bg-fg"
            style={{ left: `${clampedFraction * 100}%` }}
            title="Today"
          />
        )}
      </div>
    </div>
  )
}

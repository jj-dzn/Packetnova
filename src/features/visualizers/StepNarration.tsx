import { useEffect, useRef } from 'react'

export interface NarrationStep {
  title: string
  description: string
}

interface StepNarrationProps {
  steps: NarrationStep[]
  currentIndex: number
}

// Replaces the old pattern of showing only the current step's title and
// description, which visually disappeared the moment autoplay (or a manual
// Next click) moved on -- the animated flow itself stayed visible (each
// hop/segment is added, not replaced), but the text explaining what it was
// vanished before most visitors finished reading it. This renders every
// step's explanation up to the current one as a scrollable transcript
// instead, so the story stays readable no matter how fast autoplay runs.
//
// Stepping backward shrinks the list back down to match -- the transcript
// always reflects "the story up to where you currently are," consistent
// with how the flow animation itself already only shows completed hops.
//
// Titles are deliberately not <h2>/<h3> elements: these are transient,
// per-step log entries, not stable document sections a visitor would
// navigate to via a screen reader's heading list -- stepping through a
// 6-step handshake shouldn't balloon the page's heading outline to 6
// entries. aria-live="polite" on the scroll container means only the
// newly-appended entry gets announced, not the whole transcript each time.
export function StepNarration({ steps, currentIndex }: StepNarrationProps) {
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentIndex])

  return (
    <div
      aria-live="polite"
      className="flex max-h-64 flex-col gap-3 overflow-y-auto rounded-md border border-border bg-bg p-4"
    >
      {steps.slice(0, currentIndex + 1).map((step, index) => {
        const isCurrent = index === currentIndex
        return (
          <div
            key={index}
            ref={isCurrent ? currentRef : undefined}
            className={`border-b border-border pb-3 last:border-b-0 last:pb-0 ${isCurrent ? '' : 'opacity-60'}`}
          >
            <p className={`font-medium ${isCurrent ? '' : 'text-sm'}`}>{step.title}</p>
            <p className="mt-1 text-sm text-fg-muted">{step.description}</p>
          </div>
        )
      })}
    </div>
  )
}

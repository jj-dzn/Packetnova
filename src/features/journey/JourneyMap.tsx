interface JourneyMapStage {
  id: string
  title: string
}

interface JourneyMapProps {
  stages: JourneyMapStage[]
  currentIndex: number
  onJump: (index: number) => void
}

// Effectively a site-wide table of contents disguised as a story: every
// stage is directly clickable, not just reachable by stepping through in
// order. Two renderings of the same data -- a sticky sidebar on desktop,
// a fixed bottom rail on mobile -- rather than one layout awkwardly
// squeezed to fit both.
export function JourneyMap({ stages, currentIndex, onJump }: JourneyMapProps) {
  return (
    <nav aria-label="Journey stages">
      <ol className="hidden flex-col gap-1 lg:sticky lg:top-20 lg:flex">
        {stages.map((stage, index) => (
          <li key={stage.id}>
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === currentIndex ? 'step' : undefined}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                index === currentIndex
                  ? 'bg-accent/10 font-medium text-accent'
                  : 'text-fg-muted hover:bg-surface hover:text-fg'
              }`}
            >
              <StageMarker
                state={
                  index === currentIndex ? 'current' : index < currentIndex ? 'done' : 'upcoming'
                }
              >
                {index + 1}
              </StageMarker>
              {stage.title}
            </button>
          </li>
        ))}
      </ol>

      <ol className="fixed inset-x-0 bottom-0 z-20 flex gap-1.5 overflow-x-auto border-t border-border bg-bg/95 px-3 py-2 backdrop-blur-sm lg:hidden">
        {stages.map((stage, index) => (
          <li key={stage.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === currentIndex ? 'step' : undefined}
              aria-label={stage.title}
              title={stage.title}
              className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <StageMarker
                state={
                  index === currentIndex ? 'current' : index < currentIndex ? 'done' : 'upcoming'
                }
              >
                {index + 1}
              </StageMarker>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function StageMarker({
  state,
  children,
}: {
  state: 'current' | 'done' | 'upcoming'
  children: number
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] ${
        state === 'current'
          ? 'bg-accent text-white'
          : state === 'done'
            ? 'bg-accent-alt/20 text-accent-alt'
            : 'border border-border text-fg-subtle'
      }`}
    >
      {state === 'done' ? '✓' : children}
    </span>
  )
}

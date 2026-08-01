import { useState, type ReactNode } from 'react'
import { Pill } from '../../components/ui/Pill'
import { StepControls } from '../visualizers/StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'

export interface GuidedStep {
  title: string
  description: string
  content?: ReactNode
}

interface GuidedModeProps {
  steps: GuidedStep[]
  /** The tool's normal instant-view result content, shown when guided mode
   * is off. */
  children: ReactNode
  /** Shown once, on the final step -- the "connects the math to a real
   * situation" sentence every guided walkthrough closes on. */
  closingNote?: ReactNode
}

// Opt-in walkthrough built directly on useStepPlayer/StepControls -- the
// exact hook and component pair already driving all 11 visualizers, so a
// calculator's guided mode needs zero new interaction design: visitors get
// the identical keyboard nav (arrow keys, spacebar autoplay, automatic
// reduced-motion fallback) they already learned on the visualizer pages.
export function GuidedMode({ steps, children, closingNote }: GuidedModeProps) {
  const [active, setActive] = useState(false)
  const player = useStepPlayer(steps.length)
  const current = steps[player.step]

  return (
    <div className="flex flex-col gap-4">
      <Pill active={active} onClick={() => setActive((value) => !value)} className="self-start">
        {active ? 'Hide' : 'Show'} guided walkthrough
      </Pill>
      {active && current ? (
        <div
          tabIndex={0}
          onKeyDown={player.onKeyDown}
          aria-label="Guided walkthrough. Use the Previous and Next buttons, or the left and right arrow keys, to step through."
          className="flex flex-col gap-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <div aria-live="polite">
            <h3 className="font-medium">{current.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">{current.description}</p>
          </div>
          {current.content}
          <StepControls player={player} totalSteps={steps.length} />
          {player.isLast && closingNote && (
            <p className="border-t border-border pt-3 text-xs text-fg-subtle">{closingNote}</p>
          )}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

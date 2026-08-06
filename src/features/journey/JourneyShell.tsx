import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '../../components/ui/Button'
import type { MascotMood } from '../../components/ui/Mascot'
import { JourneyMap } from './JourneyMap'
import { JourneyGuide } from './JourneyGuide'
import { ScenarioEmbedContext } from '../scenarios/ScenarioEmbedContext'
import { useStepPlayer } from '../../hooks/useStepPlayer'
import { PathContextBanner } from '../paths/PathContextBanner'

export interface JourneyStage {
  id: string
  title: string
  mood: MascotMood
  narration: string
  /** A genuine branch point -- rendered as its own distinct block between
   * the narration and the stage content, not crammed into the narration
   * paragraph itself. */
  choice?: ReactNode
  content: ReactNode
}

export interface JourneyFamilyLink {
  to: string
  title: string
  description: string
}

interface JourneyShellProps {
  eyebrow?: string
  title: string
  description: string
  stages: JourneyStage[]
  /** Other journeys, cross-promoted below the stage player -- this is the
   * whole "family" discovery mechanism: no separate index page, each
   * journey just points at its siblings. */
  otherJourneys?: JourneyFamilyLink[]
}

// The shared engine every named journey runs on -- extracted from what was
// originally NetworkJourneyPage's own inline layout/step-player logic, so
// each new journey is just its own stages array plus this shell, not a
// second copy of the player/map/guide wiring.
export function JourneyShell({
  eyebrow = 'Packet journey',
  title,
  description,
  stages,
  otherJourneys,
}: JourneyShellProps) {
  const player = useStepPlayer(stages.length)
  const current = stages[player.step]!

  return (
    <div className="relative pb-24 pt-12 lg:pb-12">
      <div className="mb-8 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-fg-muted">{description}</p>
      </div>

      <PathContextBanner />

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
        <JourneyMap stages={stages} currentIndex={player.step} onJump={player.goTo} />

        <div
          tabIndex={0}
          onKeyDown={player.onKeyDown}
          aria-label={`${title}. Use the Previous and Next buttons, or the left and right arrow keys, to step through.`}
          className="flex flex-col gap-6 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <h2 className="text-lg font-semibold">{current.title}</h2>
          <JourneyGuide mood={current.mood}>{current.narration}</JourneyGuide>
          {current.choice}

          <ScenarioEmbedContext.Provider value={true}>
            {current.content}
          </ScenarioEmbedContext.Provider>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={player.previous} disabled={player.isFirst}>
              Previous stage
            </Button>
            <p className="text-sm text-fg-muted">
              Stage {player.step + 1} of {stages.length}
            </p>
            <Button onClick={player.next} disabled={player.isLast}>
              Next stage
            </Button>
          </div>

          {otherJourneys && otherJourneys.length > 0 && player.isLast && (
            <div className="border-t border-border pt-6">
              <p className="mb-3 text-sm font-medium">More journeys</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherJourneys.map((journey) => (
                  <Link
                    key={journey.to}
                    to={journey.to}
                    className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
                  >
                    <p className="text-sm font-medium">{journey.title}</p>
                    <p className="mt-1 text-xs text-fg-muted">{journey.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

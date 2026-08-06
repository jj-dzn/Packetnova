import { Link } from 'react-router'
import { SectionHeader } from './SectionHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { competencyPaths } from '../../content/reference/paths'
import { resolvePathStep } from '../../lib/content/resolvePathStep'
import { pathStepKey as stepKey } from '../../lib/content/pathStepKey'
import { usePathProgress } from '../../hooks/usePathProgress'

// Only renders once a path has been started but not finished -- a
// first-time visitor, and anyone who's completed every path they started,
// see nothing here rather than an empty or "get started" placeholder,
// matching ContinueWhereYouLeftOff's same restraint.
export function ContinuePathTeaser() {
  const { progress } = usePathProgress()

  const active = competencyPaths
    .map((path) => {
      const resolvedSteps = path.steps
        .map((step) => ({ step, resolved: resolvePathStep(step) }))
        .filter(
          (
            entry,
          ): entry is { step: typeof entry.step; resolved: NonNullable<typeof entry.resolved> } =>
            Boolean(entry.resolved),
        )
      const completed = new Set(progress[path.slug] ?? [])
      const completedCount = resolvedSteps.filter(({ step }) => completed.has(stepKey(step))).length
      const next = resolvedSteps.find(({ step }) => !completed.has(stepKey(step)))
      return { path, totalSteps: resolvedSteps.length, completedCount, next }
    })
    .find(
      ({ completedCount, totalSteps, next }) =>
        completedCount > 0 && completedCount < totalSteps && next,
    )

  if (!active || !active.next) return null

  return (
    <section className="py-14">
      <SectionHeader
        title="Continue your path"
        subtitle="Picked up from this browser, not an account"
      />
      <Link to={active.next.resolved.href} className="block">
        <Card
          interactive
          tilt
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <Badge tone="accent">{active.path.category}</Badge>
            <h3 className="mt-2 font-medium">{active.path.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              {active.completedCount} of {active.totalSteps} complete -- next:{' '}
              {active.next.resolved.title}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-accent">Continue &rarr;</span>
        </Card>
      </Link>
    </section>
  )
}

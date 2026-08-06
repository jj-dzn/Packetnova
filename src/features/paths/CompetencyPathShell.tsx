import { useEffect } from 'react'
import { Link } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { resolvePathStep } from '../../lib/content/resolvePathStep'
import { pathStepKey as stepKey } from '../../lib/content/pathStepKey'
import { usePathProgress } from '../../hooks/usePathProgress'
import { reportMascotMood } from '../../lib/mascotMood'
import { competencyPaths, otherPaths, type PathStep } from '../../content/reference/paths'

interface CompetencyPathShellProps {
  slug: string
}

// The shared engine every named competency path runs on -- resolves each
// step's type+slug reference against the real content arrays, tracks
// completion in localStorage, and highlights whichever step comes next.
// A path adds no new UI per step type; it's purely curation and sequence
// over content that already has its own page elsewhere on the site.
export function CompetencyPathShell({ slug }: CompetencyPathShellProps) {
  const path = competencyPaths.find((p) => p.slug === slug)
  const breadcrumbSchema = useBreadcrumbSchema('Paths', '/paths', path?.title ?? 'Path')
  const { progress, toggle } = usePathProgress()

  const completed = new Set(path ? (progress[path.slug] ?? []) : [])
  const resolvedSteps = (path?.steps ?? [])
    .map((step) => ({ step, resolved: resolvePathStep(step) }))
    .filter((entry): entry is { step: PathStep; resolved: NonNullable<typeof entry.resolved> } =>
      Boolean(entry.resolved),
    )
  const completedCount = resolvedSteps.filter(({ step }) => completed.has(stepKey(step))).length
  const nextIndex = resolvedSteps.findIndex(({ step }) => !completed.has(stepKey(step)))
  const isDone = resolvedSteps.length > 0 && nextIndex === -1

  // Finishing every step is a real achievement the progress store already
  // tracks -- worth a "fast" mascot reaction the moment the last box gets
  // checked, not just a silent badge.
  useEffect(() => {
    if (isDone) reportMascotMood('fast')
  }, [isDone])

  if (!path) return null

  return (
    <div className="py-12">
      <StructuredData data={breadcrumbSchema} />
      <div className="mb-8 max-w-2xl">
        <Badge tone="accent">{path.category}</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{path.title}</h1>
        <p className="mt-2 text-fg-muted">{path.description}</p>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(completedCount / resolvedSteps.length) * 100}%` }}
          />
        </div>
        <p className="shrink-0 text-sm text-fg-muted">
          {completedCount} of {resolvedSteps.length} complete
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {resolvedSteps.map(({ step, resolved }, index) => {
          const key = stepKey(step)
          const isComplete = completed.has(key)
          const isNext = index === nextIndex
          return (
            <li
              key={key}
              className={`rounded-lg border p-4 sm:p-5 ${
                isNext ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggle(path.slug, key)}
                  aria-pressed={isComplete}
                  aria-label={
                    isComplete
                      ? `Mark "${resolved.title}" incomplete`
                      : `Mark "${resolved.title}" complete`
                  }
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                    isComplete
                      ? 'border-success bg-success/15 text-success'
                      : 'border-border text-fg-subtle hover:border-accent/40'
                  }`}
                >
                  {isComplete ? '✓' : index + 1}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{resolved.typeLabel}</Badge>
                    {isNext && <Badge tone="accent">Continue here</Badge>}
                  </div>
                  <h2 className="mt-1.5 font-medium">{resolved.title}</h2>
                  <p className="mt-1 text-sm text-fg-muted">{step.note}</p>
                </div>
                <Link to={resolved.href} className="shrink-0">
                  <Button variant="secondary">Open</Button>
                </Link>
              </div>
            </li>
          )
        })}
      </ol>

      {isDone && (
        <div className="mt-8 rounded-lg border border-success/30 bg-success/5 p-6 text-center">
          <p className="text-sm font-medium text-success">Path complete</p>
          <p className="mt-1 text-sm text-fg-muted">Every step in {path.title} is checked off.</p>
        </div>
      )}

      <div className="mt-10 border-t border-border pt-8">
        <p className="mb-3 text-sm font-medium">More paths</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {otherPaths(path.slug).map((other) => (
            <Link
              key={other.slug}
              to={`/paths/${other.slug}`}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <p className="text-sm font-medium">{other.title}</p>
              <p className="mt-1 text-xs text-fg-muted">{other.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

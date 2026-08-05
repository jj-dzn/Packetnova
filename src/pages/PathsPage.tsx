import { Link } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { competencyPaths } from '../content/reference/paths'
import { resolvePathStep } from '../lib/content/resolvePathStep'
import { usePathProgress } from '../hooks/usePathProgress'

export function PathsPage() {
  const { progress } = usePathProgress()

  return (
    <div className="py-16">
      <div className="mb-12 text-center">
        <Badge tone="accent">{competencyPaths.length} paths</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Guided paths</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Curated, ordered sequences through tools, visualizers, and scenarios that already exist on
          the site -- built around a real skill, not a certification blueprint. Progress is tracked
          in this browser, no account needed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competencyPaths.map((path) => {
          const stepCount = path.steps.filter((step) => resolvePathStep(step)).length
          const completed = progress[path.slug] ?? []
          const completedCount = completed.filter((key) =>
            path.steps.some((step) => `${step.type}:${step.slug}` === key),
          ).length
          const inProgress = completedCount > 0 && completedCount < stepCount

          return (
            <Link key={path.slug} to={`/paths/${path.slug}`} className="block">
              <Card interactive tilt className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Badge tone="accent">{path.category}</Badge>
                  {completedCount === stepCount ? (
                    <Badge tone="success">Complete</Badge>
                  ) : inProgress ? (
                    <span className="text-xs text-fg-subtle">
                      {completedCount} of {stepCount}
                    </span>
                  ) : (
                    <span className="text-xs text-fg-subtle">{stepCount} steps</span>
                  )}
                </div>
                <h3 className="font-medium">{path.title}</h3>
                <p className="text-sm text-fg-muted">{path.description}</p>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

import { Link, useLocation } from 'react-router'
import { findPathContextForHref } from '../../lib/content/pathStepByHref'

// Self-contained on purpose -- reads its own route via useLocation() and
// looks itself up against every real path's steps, so it can be dropped
// into ToolPageLayout/VisualizerPageLayout/ScenarioPageLayout/
// BranchingScenario/JourneyShell with zero changes to any individual
// tool/visualizer/scenario/journey file. Paths already link out to their
// steps; this is the reverse direction, so a visitor who lands on a step
// page directly (search, a bookmark, a link from elsewhere) discovers the
// path it's part of instead of that connection only working one way.
export function PathContextBanner() {
  const { pathname } = useLocation()
  const context = findPathContextForHref(pathname)
  if (!context) return null

  const { path, index } = context

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm">
      <p className="text-fg-muted">
        Part of the{' '}
        <Link to={`/paths/${path.slug}`} className="font-medium text-accent hover:underline">
          {path.title}
        </Link>{' '}
        path -- step {index + 1} of {path.steps.length}
      </p>
      <Link
        to={`/paths/${path.slug}`}
        className="shrink-0 text-xs font-medium text-accent hover:underline"
      >
        Continue the path &rarr;
      </Link>
    </div>
  )
}

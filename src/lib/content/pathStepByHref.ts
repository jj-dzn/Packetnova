import { competencyPaths, type CompetencyPath, type PathStep } from '../../content/reference/paths'
import { resolvePathStep } from './resolvePathStep'

export interface PathStepContext {
  path: CompetencyPath
  step: PathStep
  index: number
}

// Built once at module load, not per-render or per-route: every real path
// step's resolved href, reversed into a pathname -> context lookup. Since
// every tool/visualizer/scenario/journey route in App.tsx is a literal,
// static path (no :slug params), a page's own `pathname` from useLocation()
// is guaranteed to exactly match the href resolvePathStep() would produce
// for that same content -- so this lookup works for any of the four page
// types with the same one map, no per-type parsing needed.
//
// Assumes each href appears in at most one path today (true of all five
// current paths) -- first match wins if that ever stops being true, which
// would only affect which path a page credits itself to, not correctness.
const byHref = new Map<string, PathStepContext>()
for (const path of competencyPaths) {
  path.steps.forEach((step, index) => {
    const resolved = resolvePathStep(step)
    if (resolved && !byHref.has(resolved.href)) {
      byHref.set(resolved.href, { path, step, index })
    }
  })
}

export function findPathContextForHref(pathname: string): PathStepContext | undefined {
  return byHref.get(pathname)
}

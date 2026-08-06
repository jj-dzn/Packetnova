import { competencyPaths } from '../../content/reference/paths'
import { resolvePathStep } from './resolvePathStep'
import { pathStepKey } from './pathStepKey'
import { getPathProgress } from '../storage/pathProgress'

// A path counts as "active" the same way ContinuePathTeaser's homepage
// section does -- at least one step done, not every step done. Untouched
// and fully-finished paths both return no next step: nothing to boost
// search toward in either case.
export function getActivePathNextStepHrefs(): Set<string> {
  const progress = getPathProgress()
  const hrefs = new Set<string>()

  for (const path of competencyPaths) {
    const completed = new Set(progress[path.slug] ?? [])
    if (completed.size === 0 || completed.size >= path.steps.length) continue

    const next = path.steps.find((step) => !completed.has(pathStepKey(step)))
    if (!next) continue

    const resolved = resolvePathStep(next)
    if (resolved) hrefs.add(resolved.href)
  }

  return hrefs
}

import type { PathStep } from '../../content/reference/paths'

// The one place this format is defined -- `${type}:${slug}` -- previously
// duplicated identically in CompetencyPathShell.tsx and
// ContinuePathTeaser.tsx, now a third consumer (activePathNextStep.ts)
// made that worth collapsing into one function.
export function pathStepKey(step: Pick<PathStep, 'type' | 'slug'>): string {
  return `${step.type}:${step.slug}`
}

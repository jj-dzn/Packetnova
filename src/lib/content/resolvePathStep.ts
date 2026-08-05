import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'
import { scenarios } from '../../content/reference/scenarios'
import { JOURNEYS } from '../../features/journey/journeyFamily'
import type { PathStep } from '../../content/reference/paths'

export interface ResolvedPathStep {
  title: string
  description: string
  href: string
  typeLabel: string
}

function findTool(slug: string) {
  for (const category of toolCategories) {
    const tool = category.tools.find((t) => t.slug === slug)
    if (tool) return tool
  }
  return undefined
}

// Every path step just names a type and a slug -- this is the one place
// that turns that reference into something renderable, so a path never
// needs to know each content type's own field names (tools/visualizers
// use name/description, scenarios use title/symptom, journeys use
// to/title/description) or its own route prefix.
export function resolvePathStep(step: PathStep): ResolvedPathStep | null {
  switch (step.type) {
    case 'tool': {
      const tool = findTool(step.slug)
      if (!tool) return null
      return {
        title: tool.name,
        description: tool.description,
        href: `/tools/${step.slug}`,
        typeLabel: 'Tool',
      }
    }
    case 'visualizer': {
      const visualizer = visualizers.find((v) => v.slug === step.slug)
      if (!visualizer) return null
      return {
        title: visualizer.name,
        description: visualizer.description,
        href: `/visualizers/${step.slug}`,
        typeLabel: 'Visualizer',
      }
    }
    case 'scenario': {
      const scenario = scenarios.find((s) => s.slug === step.slug)
      if (!scenario) return null
      return {
        title: scenario.title,
        description: scenario.symptom,
        href: `/scenarios/${step.slug}`,
        typeLabel: 'Scenario',
      }
    }
    case 'journey': {
      const href = step.slug ? `/journey/${step.slug}` : '/journey'
      const journey = JOURNEYS.find((j) => j.to === href)
      if (!journey) return null
      return { title: journey.title, description: journey.description, href, typeLabel: 'Journey' }
    }
  }
}

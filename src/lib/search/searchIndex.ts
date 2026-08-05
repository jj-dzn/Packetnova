import Fuse from 'fuse.js'
import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'
import { scenarios } from '../../content/reference/scenarios'
import { competencyPaths } from '../../content/reference/paths'

export interface SearchItem {
  type: 'tool' | 'visualizer' | 'scenario' | 'path'
  title: string
  description: string
  category: string
  href: string | null
}

function buildToolSearchItems(): SearchItem[] {
  return toolCategories.flatMap((category) =>
    category.tools.map((tool) => ({
      type: 'tool' as const,
      title: tool.name,
      description: tool.description,
      category: category.label,
      href: tool.slug ? `/tools/${tool.slug}` : null,
    })),
  )
}

function buildVisualizerSearchItems(): SearchItem[] {
  return visualizers.map((visualizer) => ({
    type: 'visualizer' as const,
    title: visualizer.name,
    description: visualizer.description,
    category: 'Visualizer',
    href: visualizer.slug ? `/visualizers/${visualizer.slug}` : null,
  }))
}

function buildScenarioSearchItems(): SearchItem[] {
  return scenarios.map((scenario) => ({
    type: 'scenario' as const,
    title: scenario.title,
    description: scenario.symptom,
    category: scenario.category,
    href: `/scenarios/${scenario.slug}`,
  }))
}

function buildPathSearchItems(): SearchItem[] {
  return competencyPaths.map((path) => ({
    type: 'path' as const,
    title: path.title,
    description: path.description,
    category: path.category,
    href: `/paths/${path.slug}`,
  }))
}

export const searchItems: SearchItem[] = [
  ...buildToolSearchItems(),
  ...buildVisualizerSearchItems(),
  ...buildScenarioSearchItems(),
  ...buildPathSearchItems(),
]

export const searchIndex = new Fuse<SearchItem>(searchItems, {
  keys: ['title', 'description', 'category'],
  threshold: 0.35,
  ignoreLocation: true,
})

import Fuse from 'fuse.js'
import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'

export interface SearchItem {
  type: 'tool' | 'visualizer'
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

// "Content that exists so far" per ROADMAP.md's Milestone 7 -- extend this
// as blog posts get real content of their own.
export const searchItems: SearchItem[] = [
  ...buildToolSearchItems(),
  ...buildVisualizerSearchItems(),
]

export const searchIndex = new Fuse<SearchItem>(searchItems, {
  keys: ['title', 'description', 'category'],
  threshold: 0.35,
  ignoreLocation: true,
})

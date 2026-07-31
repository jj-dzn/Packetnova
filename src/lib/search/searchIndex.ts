import Fuse from 'fuse.js'
import { toolCategories } from '../../content/reference/tools'

export interface SearchItem {
  type: 'tool'
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

// "Content that exists so far" per ROADMAP.md's Milestone 7 -- extend this
// as visualizers and blog posts get real content of their own.
export const searchItems: SearchItem[] = [...buildToolSearchItems()]

export const searchIndex = new Fuse<SearchItem>(searchItems, {
  keys: ['title', 'description', 'category'],
  threshold: 0.35,
  ignoreLocation: true,
})

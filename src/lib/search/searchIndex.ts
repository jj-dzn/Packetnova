import Fuse from 'fuse.js'
import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'
import { blogPosts } from '../blog/posts'

export interface SearchItem {
  type: 'tool' | 'visualizer' | 'blog'
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

function buildBlogSearchItems(): SearchItem[] {
  return blogPosts.map((post) => ({
    type: 'blog' as const,
    title: post.title,
    description: post.description,
    category: 'Blog',
    href: `/blog/${post.slug}`,
  }))
}

export const searchItems: SearchItem[] = [
  ...buildToolSearchItems(),
  ...buildVisualizerSearchItems(),
  ...buildBlogSearchItems(),
]

export const searchIndex = new Fuse<SearchItem>(searchItems, {
  keys: ['title', 'description', 'category'],
  threshold: 0.35,
  ignoreLocation: true,
})

import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'
import { blogPosts } from '../blog/posts'

export interface PageMeta {
  title: string
  description: string
}

const SITE_TITLE = 'PacketNova'
const DEFAULT_DESCRIPTION =
  'Free, client-side networking toolkit: calculators, protocol explorers, and interactive visualizers.'

const STATIC_PAGES: Record<string, PageMeta> = {
  '/': {
    title: `${SITE_TITLE} - Networking tools built for engineers`,
    description: DEFAULT_DESCRIPTION,
  },
  '/tools': {
    title: `Tools - ${SITE_TITLE}`,
    description: 'Every calculator and reference tool on PacketNova, organized by category.',
  },
  '/visualizers': {
    title: `Visualizers - ${SITE_TITLE}`,
    description: 'Step-by-step animations of how networking protocols actually work.',
  },
  '/blog': {
    title: `Blog - ${SITE_TITLE}`,
    description: 'Networking write-ups -- practical, accurate, no fluff.',
  },
  '/search': {
    title: `Search - ${SITE_TITLE}`,
    description: "Search PacketNova's tools, visualizers, and blog posts.",
  },
}

const NOT_FOUND_META: PageMeta = {
  title: `Page not found - ${SITE_TITLE}`,
  description: DEFAULT_DESCRIPTION,
}

function findToolBySlug(slug: string) {
  for (const category of toolCategories) {
    const tool = category.tools.find((t) => t.slug === slug)
    if (tool) return tool
  }
  return undefined
}

// Derives per-page <title>/description from the route path against the
// same content data (tools.ts, visualizers.ts, blog posts) every listing
// page already uses -- rather than hand-adding a meta call to each of the
// ~65 individual tool/visualizer/post page components (tedious, and every
// future one would have to remember it too), this one lookup stays correct
// automatically as content is added.
export function getPageMeta(pathname: string): PageMeta {
  const staticMeta = STATIC_PAGES[pathname]
  if (staticMeta) return staticMeta

  const toolMatch = /^\/tools\/([^/]+)$/.exec(pathname)
  if (toolMatch) {
    const tool = findToolBySlug(toolMatch[1]!)
    if (tool) return { title: `${tool.name} - ${SITE_TITLE}`, description: tool.description }
  }

  const visualizerMatch = /^\/visualizers\/([^/]+)$/.exec(pathname)
  if (visualizerMatch) {
    const visualizer = visualizers.find((v) => v.slug === visualizerMatch[1])
    if (visualizer) {
      return { title: `${visualizer.name} - ${SITE_TITLE}`, description: visualizer.description }
    }
  }

  const blogMatch = /^\/blog\/([^/]+)$/.exec(pathname)
  if (blogMatch) {
    const post = blogPosts.find((p) => p.slug === blogMatch[1])
    if (post) return { title: `${post.title} - ${SITE_TITLE}`, description: post.description }
  }

  return NOT_FOUND_META
}

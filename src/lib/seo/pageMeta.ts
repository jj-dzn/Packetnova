import { toolCategories } from '../../content/reference/tools'
import { visualizers } from '../../content/reference/visualizers'
import { scenarios } from '../../content/reference/scenarios'
import { blogPosts } from '../blog/posts'

export interface PageMeta {
  title: string
  description: string
}

export const SITE_URL = 'https://packetnova.ca'
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
  '/scenarios': {
    title: `Scenarios - ${SITE_TITLE}`,
    description: 'Guided troubleshooting labs that chain real tools and visualizers together.',
  },
  '/blog': {
    title: `Blog - ${SITE_TITLE}`,
    description: 'Networking write-ups -- practical, accurate, no fluff.',
  },
  '/search': {
    title: `Search - ${SITE_TITLE}`,
    description: "Search PacketNova's tools, visualizers, and blog posts.",
  },
  '/labs': {
    title: `Labs - ${SITE_TITLE}`,
    description: 'A small, playful corner of PacketNova -- built for fun, not diagnostics.',
  },
  '/labs/ping-pet': {
    title: `Ping pet - ${SITE_TITLE}`,
    description: 'A small creature whose mood tracks live latency to a host you pick.',
  },
  '/labs/ip-zodiac': {
    title: `IP address zodiac - ${SITE_TITLE}`,
    description: 'Enter an IP and find out what its octets say about its personality.',
  },
  '/labs/handle-generator': {
    title: `Handle generator - ${SITE_TITLE}`,
    description: 'Generate a cyberpunk hacker alias and clearance level, movie-style.',
  },
  '/labs/cursed-config': {
    title: `Cursed config generator - ${SITE_TITLE}`,
    description: 'Authentic-looking router CLI syntax, completely fake settings.',
  },
  '/labs/hacker-typer': {
    title: `Hacker typer - ${SITE_TITLE}`,
    description: "Mash any key. Look like you know exactly what you're doing.",
  },
  '/labs/dial-up': {
    title: `Dial-up simulator - ${SITE_TITLE}`,
    description: 'Relive the screech of a 56k modem connecting to the internet.',
  },
  '/labs/blue-screen': {
    title: `Blue screen button - ${SITE_TITLE}`,
    description: 'Push it. Watch PacketNova "crash" into a fake blue screen.',
  },
  '/labs/traceroute-ghost': {
    title: `Traceroute ghost - ${SITE_TITLE}`,
    description: 'A ghost travels hop by hop, getting more tired as latency climbs.',
  },
  '/labs/ping-pet-duel': {
    title: `Ping pet duel - ${SITE_TITLE}`,
    description: 'Two pets, two hosts, one latency duel. Fastest round trip wins.',
  },
  '/labs/signal-decoder': {
    title: `Signal decoder - ${SITE_TITLE}`,
    description: 'Watch any text ripple through Morse, binary, hex, and Base64.',
  },
  '/labs/404-maze': {
    title: `404 maze - ${SITE_TITLE}`,
    description: 'Dead ends are fake HTTP errors. One lucky cell is a cached shortcut.',
  },
  '/labs/packet-snake': {
    title: `Packet snake - ${SITE_TITLE}`,
    description: 'Classic Snake, reskinned as a data stream eating loose packets.',
  },
  '/labs/packet-runner': {
    title: `Packet runner - ${SITE_TITLE}`,
    description: 'Dodge firewalls and congestion, collect routers, on a scrolling track.',
  },
  '/terminal': {
    title: `Terminal - ${SITE_TITLE}`,
    description: DEFAULT_DESCRIPTION,
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

  const scenarioMatch = /^\/scenarios\/([^/]+)$/.exec(pathname)
  if (scenarioMatch) {
    const scenario = scenarios.find((s) => s.slug === scenarioMatch[1])
    if (scenario)
      return { title: `${scenario.title} - ${SITE_TITLE}`, description: scenario.symptom }
  }

  const blogMatch = /^\/blog\/([^/]+)$/.exec(pathname)
  if (blogMatch) {
    const post = blogPosts.find((p) => p.slug === blogMatch[1])
    if (post) return { title: `${post.title} - ${SITE_TITLE}`, description: post.description }
  }

  return NOT_FOUND_META
}

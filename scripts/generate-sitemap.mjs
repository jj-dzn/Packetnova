// Generates public/sitemap.xml before each build, from the same content
// data the site itself renders from -- so it can never drift out of sync
// with what's actually live.
//
// Runs as a plain Node script (not through Vite), since sitemap generation
// only needs to happen once per build, not bundled into the app. tools.ts
// and visualizers.ts import cleanly under Node's native TypeScript support
// (no Vite-specific syntax).

import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const SITE_URL = 'https://packetnova.ca'

// Dynamic import() needs a file:// URL, not a raw filesystem path -- a bare
// Windows path like "C:\..." isn't a URL scheme ESM's loader recognizes.
function importFrom(relativePath) {
  return import(pathToFileURL(path.join(rootDir, relativePath)).href)
}

const { toolCategories } = await importFrom('src/content/reference/tools.ts')
const { visualizers } = await importFrom('src/content/reference/visualizers.ts')
const { scenarios } = await importFrom('src/content/reference/scenarios.ts')
const { competencyPaths } = await importFrom('src/content/reference/paths.ts')

const staticPaths = [
  '/',
  '/tools',
  '/visualizers',
  '/scenarios',
  '/paths',
  '/notebook',
  '/about',
  '/journey',
  '/journey/nat',
  '/journey/vpn-tunnel',
  '/journey/bgp-path',
  '/labs',
  '/labs/ping-pet',
  '/labs/ip-zodiac',
  '/labs/handle-generator',
  '/labs/cursed-config',
  '/labs/hacker-typer',
  '/labs/dial-up',
  '/labs/blue-screen',
  '/labs/traceroute-ghost',
  '/labs/ping-pet-duel',
  '/labs/signal-decoder',
  '/labs/404-maze',
  '/labs/packet-snake',
  '/labs/packet-runner',
  '/terminal',
]

const toolPaths = toolCategories.flatMap((category) =>
  category.tools.filter((tool) => tool.slug).map((tool) => `/tools/${tool.slug}`),
)

const visualizerPaths = visualizers
  .filter((visualizer) => visualizer.slug)
  .map((visualizer) => `/visualizers/${visualizer.slug}`)

const scenarioPaths = scenarios
  .filter((scenario) => scenario.slug)
  .map((scenario) => `/scenarios/${scenario.slug}`)

const competencyPathPaths = competencyPaths.map((path) => `/paths/${path.slug}`)

const allPaths = [
  ...staticPaths,
  ...toolPaths,
  ...visualizerPaths,
  ...scenarioPaths,
  ...competencyPathPaths,
]

const today = new Date().toISOString().slice(0, 10)

const body = allPaths
  .map(
    (urlPath) => `  <url>
    <loc>${SITE_URL}${urlPath}</loc>
    <lastmod>${today}</lastmod>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(path.join(rootDir, 'public/sitemap.xml'), xml)
console.log(`Generated sitemap.xml with ${allPaths.length} URLs.`)

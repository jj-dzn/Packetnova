export type LatencyBand = 'fast' | 'medium' | 'slow' | 'error'

export interface PingTarget {
  label: string
  host: string
}

export const PING_TARGETS: PingTarget[] = [
  { label: 'Cloudflare', host: 'cloudflare.com' },
  { label: 'Google', host: 'google.com' },
  { label: 'GitHub', host: 'github.com' },
  { label: 'Wikipedia', host: 'wikipedia.org' },
]

const FAST_THRESHOLD_MS = 100
const MEDIUM_THRESHOLD_MS = 300

export function classifyLatency(ms: number | null): LatencyBand {
  if (ms === null) return 'error'
  if (ms < FAST_THRESHOLD_MS) return 'fast'
  if (ms < MEDIUM_THRESHOLD_MS) return 'medium'
  return 'slow'
}

export function buildPingUrl(host: string): string {
  return `https://${host}/favicon.ico?_=${Date.now()}`
}

// A real ICMP ping isn't available from browser JS, so this times a
// no-cors fetch instead: the browser still performs the full network round
// trip and resolves once a response (even an opaque one) comes back, and
// rejects on a genuine DNS/connection failure -- close enough for a fun,
// approximate reading, not a diagnostic tool.
export async function measureLatency(host: string, timeoutMs = 5000): Promise<number | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const start = performance.now()
  try {
    await fetch(buildPingUrl(host), {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    })
    return performance.now() - start
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

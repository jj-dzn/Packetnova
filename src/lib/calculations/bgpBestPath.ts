import { parseIPv4 } from '../validation/ip'
import type { CalculationResult } from './result'

export type BgpOrigin = 'igp' | 'egp' | 'incomplete'

export interface BgpCandidate {
  id: string
  weight: number
  localPreference: number
  locallyOriginated: boolean
  asPathLength: number
  origin: BgpOrigin
  med: number
  isEbgp: boolean
  igpMetricToNextHop: number
  routeAgeSeconds: number
  routerId: string
  neighborIp: string
}

export interface BgpStepTrace {
  step: string
  remaining: string[]
}

export interface BgpResult {
  winnerId: string
  decidedByStep: string
  trace: BgpStepTrace[]
}

const ORIGIN_RANK: Record<BgpOrigin, number> = { igp: 0, egp: 1, incomplete: 2 }

function narrow(
  candidates: BgpCandidate[],
  step: string,
  keyFn: (candidate: BgpCandidate) => number,
  preferLower: boolean,
): { candidates: BgpCandidate[]; trace: BgpStepTrace } {
  const values = candidates.map(keyFn)
  const best = preferLower ? Math.min(...values) : Math.max(...values)
  const next = candidates.filter((candidate) => keyFn(candidate) === best)
  return { candidates: next, trace: { step, remaining: next.map((candidate) => candidate.id) } }
}

// Standard BGP best path selection order (RFC 4271 plus the common
// vendor-added Weight/Local-Preference/oldest-route steps taught in every
// BGP curriculum). Each step only runs while more than one candidate
// remains tied from the previous step.
const STEPS: [string, (candidate: BgpCandidate) => number, boolean][] = [
  ['Highest weight', (c) => c.weight, false],
  ['Highest local preference', (c) => c.localPreference, false],
  ['Locally originated', (c) => (c.locallyOriginated ? 1 : 0), false],
  ['Shortest AS path', (c) => c.asPathLength, true],
  ['Lowest origin type', (c) => ORIGIN_RANK[c.origin], true],
  ['Lowest MED', (c) => c.med, true],
  ['eBGP over iBGP', (c) => (c.isEbgp ? 1 : 0), false],
  ['Lowest IGP metric to next hop', (c) => c.igpMetricToNextHop, true],
  ['Oldest route', (c) => c.routeAgeSeconds, false],
  ['Lowest router ID', (c) => parseIPv4(c.routerId)!.value, true],
  ['Lowest neighbor IP', (c) => parseIPv4(c.neighborIp)!.value, true],
]

export function selectBgpBestPath(candidates: BgpCandidate[]): CalculationResult<BgpResult> {
  if (candidates.length === 0) {
    return { ok: false, error: 'Add at least one candidate path.' }
  }

  const ids = new Set(candidates.map((c) => c.id))
  if (ids.size !== candidates.length) {
    return { ok: false, error: 'Each candidate needs a unique name.' }
  }
  for (const candidate of candidates) {
    if (!parseIPv4(candidate.routerId)) {
      return { ok: false, error: `"${candidate.routerId}" is not a valid router ID.` }
    }
    if (!parseIPv4(candidate.neighborIp)) {
      return { ok: false, error: `"${candidate.neighborIp}" is not a valid neighbor IP.` }
    }
  }

  if (candidates.length === 1) {
    return {
      ok: true,
      result: { winnerId: candidates[0]!.id, decidedByStep: 'Only one candidate', trace: [] },
    }
  }

  const trace: BgpStepTrace[] = []
  let remaining = candidates
  let decidedByStep = ''

  for (const [step, keyFn, preferLower] of STEPS) {
    if (remaining.length <= 1) break
    const narrowed = narrow(remaining, step, keyFn, preferLower)
    trace.push(narrowed.trace)
    if (narrowed.candidates.length < remaining.length) decidedByStep = step
    remaining = narrowed.candidates
  }

  return {
    ok: true,
    result: {
      winnerId: remaining[0]!.id,
      decidedByStep: decidedByStep || 'Tied on every step (arbitrary)',
      trace,
    },
  }
}

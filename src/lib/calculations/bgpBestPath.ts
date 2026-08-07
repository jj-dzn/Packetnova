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
  /** The AS this path was learned from -- MED is only meaningfully
   * comparable between paths sharing the same neighboring AS (RFC 4271
   * 9.1.2.2), so this determines which candidates the MED step actually
   * compares against each other. This simulator doesn't model
   * "always-compare-med". */
  neighborAsNumber: number
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

// MED is only compared between candidates learned from the same
// neighboring AS -- so this narrows independently within each
// neighbor-AS group, then keeps every group's own lowest-MED
// survivor(s), rather than picking one lowest MED across all candidates
// regardless of which AS they came from.
function narrowMed(
  candidates: BgpCandidate[],
  step: string,
): { candidates: BgpCandidate[]; trace: BgpStepTrace } {
  const groups = new Map<number, BgpCandidate[]>()
  for (const candidate of candidates) {
    const group = groups.get(candidate.neighborAsNumber) ?? []
    group.push(candidate)
    groups.set(candidate.neighborAsNumber, group)
  }
  const next: BgpCandidate[] = []
  for (const group of groups.values()) {
    const lowestMed = Math.min(...group.map((c) => c.med))
    next.push(...group.filter((c) => c.med === lowestMed))
  }
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
    if (!Number.isInteger(candidate.neighborAsNumber) || candidate.neighborAsNumber < 1) {
      return { ok: false, error: `"${candidate.id}" needs a neighboring AS number of 1 or higher.` }
    }
    // Every field the tie-break steps key off of has to be a real number --
    // an unvalidated NaN here (from an empty/non-numeric form field) makes
    // Math.min/Math.max return NaN, which then matches nothing in narrow()'s
    // filter and collapses `remaining` to an empty array.
    if (
      !Number.isFinite(candidate.weight) ||
      !Number.isFinite(candidate.localPreference) ||
      !Number.isFinite(candidate.asPathLength) ||
      !Number.isFinite(candidate.med) ||
      !Number.isFinite(candidate.igpMetricToNextHop) ||
      !Number.isFinite(candidate.routeAgeSeconds)
    ) {
      return { ok: false, error: `"${candidate.id}" has a field that isn't a valid number.` }
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
    const narrowed =
      step === 'Lowest MED'
        ? narrowMed(remaining, step)
        : narrow(remaining, step, keyFn, preferLower)
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

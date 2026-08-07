import { load, dump } from 'js-yaml'
import type { CalculationResult } from './result'

// YAML anchors/aliases let a handful of lines "expand" into an enormous
// object graph (the classic billion-laughs pattern, applied to YAML
// instead of XML) -- js-yaml's own `load()` resolves aliases as shared
// object references rather than deep copies, so parsing alone doesn't
// blow up, but serializing the result back out (dump or JSON.stringify)
// re-visits every logical node, however many times it's aliased in.
// Walking the parsed graph first with a hard budget on total node visits
// catches this before an expensive serialization ever starts -- the
// budget strictly decreases on every visit, so even a maliciously nested
// alias chain that would "logically" expand to billions of nodes is
// caught in at most MAX_NODE_VISITS steps, not however large the real
// expansion would have been.
const MAX_NODE_VISITS = 50_000

function assertBoundedSize(value: unknown, budget: { remaining: number }): void {
  if (budget.remaining <= 0) {
    throw new Error(
      'This YAML expands to a structure too large to convert safely -- check for repeated anchors/aliases.',
    )
  }
  budget.remaining -= 1
  if (Array.isArray(value)) {
    for (const item of value) assertBoundedSize(item, budget)
  } else if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      assertBoundedSize((value as Record<string, unknown>)[key], budget)
    }
  }
}

// YAML's spec is complex enough (anchors, flow/block scalars, multi-document
// streams) that hand-rolling a parser would be a real correctness risk --
// js-yaml is the standard, long-established library for this.
export function formatYaml(input: string): CalculationResult<string> {
  try {
    const parsed: unknown = load(input)
    assertBoundedSize(parsed, { remaining: MAX_NODE_VISITS })
    return { ok: true, result: dump(parsed) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid YAML.' }
  }
}

// JSON is a valid subset of YAML, so `load` already accepts it -- this
// direction is really just "parse either, print as JSON."
export function convertYamlToJson(input: string): CalculationResult<string> {
  try {
    const parsed: unknown = load(input)
    assertBoundedSize(parsed, { remaining: MAX_NODE_VISITS })
    return { ok: true, result: JSON.stringify(parsed, null, 2) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid YAML.' }
  }
}

// `dump` accepts any JS value, so this direction is "parse as JSON, print
// as YAML" -- js-yaml's own YAML formatting handles the rest.
export function convertJsonToYaml(input: string): CalculationResult<string> {
  try {
    const parsed: unknown = JSON.parse(input)
    return { ok: true, result: dump(parsed) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON.' }
  }
}

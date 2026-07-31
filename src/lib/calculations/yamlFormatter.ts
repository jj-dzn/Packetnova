import { load, dump } from 'js-yaml'
import type { CalculationResult } from './result'

// YAML's spec is complex enough (anchors, flow/block scalars, multi-document
// streams) that hand-rolling a parser would be a real correctness risk --
// js-yaml is the standard, long-established library for this.
export function formatYaml(input: string): CalculationResult<string> {
  try {
    const parsed: unknown = load(input)
    return { ok: true, result: dump(parsed) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid YAML.' }
  }
}

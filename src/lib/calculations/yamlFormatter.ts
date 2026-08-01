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

// JSON is a valid subset of YAML, so `load` already accepts it -- this
// direction is really just "parse either, print as JSON."
export function convertYamlToJson(input: string): CalculationResult<string> {
  try {
    const parsed: unknown = load(input)
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

import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { CopyableTextarea } from '../CopyableTextarea'
import {
  convertJsonToYaml,
  convertYamlToJson,
  formatYaml,
} from '../../../lib/calculations/yamlFormatter'

type Mode = 'format' | 'yaml-to-json' | 'json-to-yaml'

const DEFAULT_YAML = 'name: PacketNova\ntools: [subnet, cidr]\nfree: true\n'
const DEFAULT_JSON = JSON.stringify(
  { name: 'PacketNova', tools: ['subnet', 'cidr'], free: true },
  null,
  2,
)

function ModeButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
}

export function YamlFormatterTool() {
  const [mode, setMode] = useState<Mode>('format')
  const [yamlInput, setYamlInput] = useState(DEFAULT_YAML)
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)

  function changeMode(next: Mode) {
    setMode(next)
  }

  const result =
    mode === 'format'
      ? formatYaml(yamlInput)
      : mode === 'yaml-to-json'
        ? convertYamlToJson(yamlInput)
        : convertJsonToYaml(jsonInput)

  const isJsonInput = mode === 'json-to-yaml'

  return (
    <ToolPageLayout
      category="Utilities"
      title="YAML formatter"
      description="Format and validate YAML, or convert between YAML and JSON."
      input={
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <ModeButton
              label="Format YAML"
              active={mode === 'format'}
              onClick={() => changeMode('format')}
            />
            <ModeButton
              label="YAML → JSON"
              active={mode === 'yaml-to-json'}
              onClick={() => changeMode('yaml-to-json')}
            />
            <ModeButton
              label="JSON → YAML"
              active={mode === 'json-to-yaml'}
              onClick={() => changeMode('json-to-yaml')}
            />
          </div>
          <textarea
            value={isJsonInput ? jsonInput : yamlInput}
            onChange={(e) =>
              isJsonInput ? setJsonInput(e.target.value) : setYamlInput(e.target.value)
            }
            rows={12}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        result.ok ? (
          <CopyableTextarea value={result.result} rows={12} />
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    />
  )
}

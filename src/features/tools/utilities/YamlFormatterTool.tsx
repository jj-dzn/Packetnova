import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { formatYaml } from '../../../lib/calculations/yamlFormatter'

export function YamlFormatterTool() {
  const [input, setInput] = useState('name: PacketNova\ntools: [subnet, cidr]\nfree: true\n')

  const result = formatYaml(input)

  return (
    <ToolPageLayout
      category="Utilities"
      title="YAML formatter"
      description="Format and validate YAML."
      input={
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
        />
      }
      result={
        result.ok ? (
          <textarea
            readOnly
            value={result.result}
            rows={12}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg"
          />
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    />
  )
}

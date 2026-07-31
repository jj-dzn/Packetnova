import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { CopyableTextarea } from '../CopyableTextarea'
import { formatXml } from '../../../lib/calculations/xmlFormatter'

export function XmlFormatterTool() {
  const [input, setInput] = useState(
    '<config><tool name="subnet">enabled</tool><tool name="cidr">enabled</tool></config>',
  )

  const result = formatXml(input)

  return (
    <ToolPageLayout
      category="Utilities"
      title="XML formatter"
      description="Format and validate XML."
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
          <CopyableTextarea value={result.result} rows={12} />
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    />
  )
}

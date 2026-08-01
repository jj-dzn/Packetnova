import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { CopyableTextarea } from '../CopyableTextarea'
import { formatJson } from '../../../lib/calculations/jsonFormatter'

export function JsonFormatterTool() {
  const [mode, setMode] = useState<'pretty' | 'minify'>('pretty')
  const [input, setInput] = useState('{"name":"PacketNova","tools":["subnet","cidr"],"free":true}')

  const result = formatJson(input, mode)

  return (
    <ToolPageLayout
      category="Utilities"
      title="JSON formatter"
      description="Format, validate, and minify JSON."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('pretty')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'pretty' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Pretty
            </button>
            <button
              type="button"
              onClick={() => setMode('minify')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'minify' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Minify
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
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

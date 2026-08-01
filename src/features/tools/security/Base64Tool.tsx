import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { CopyableTextarea } from '../CopyableTextarea'
import { base64Decode, base64Encode } from '../../../lib/calculations/base64'

export function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('Hello, PacketNova!')

  const result =
    mode === 'encode' ? { ok: true as const, result: base64Encode(input) } : base64Decode(input)

  return (
    <ToolPageLayout
      category="Security"
      title="Base64 encode/decode"
      description="Encode or decode Base64 text instantly."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'encode' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'decode' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Decode
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        result.ok ? (
          <CopyableTextarea value={result.result} />
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    />
  )
}

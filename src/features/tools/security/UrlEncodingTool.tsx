import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { CopyableTextarea } from '../CopyableTextarea'
import { urlDecode, urlEncode } from '../../../lib/calculations/urlEncoding'

export function UrlEncodingTool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('hello world & friends?')

  const result =
    mode === 'encode' ? { ok: true as const, result: urlEncode(input) } : urlDecode(input)

  return (
    <ToolPageLayout
      category="Security"
      title="URL encode/decode"
      description="Encode or decode URL-safe (percent-encoded) text instantly."
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
    >
      <ToolEducation
        howItWorks={
          <p>
            URLs can only safely contain a limited set of characters. Percent-encoding replaces
            anything outside that set with a "%" followed by its two-digit hex byte value (a space
            becomes "%20", "&" becomes "%26"), so the character survives being carried inside a URL
            without being misread as part of the URL's own syntax.
          </p>
        }
        whenToUseThis={
          <p>
            Use this whenever a value needs to go inside a query string, a path segment, or a form
            submission and might contain characters like spaces, "&", "=", or "?" that would
            otherwise be misinterpreted as part of the URL's structure rather than as data.
          </p>
        }
        commonMistakes={
          <p>
            Query strings and path segments don't encode identically -- a space in a query string is
            conventionally written as "+", while a space in a path segment must be "%20".
            Double-encoding is another common bug: running an already-encoded string through
            encoding again turns every "%" into "%25", producing a string that decodes to garbage.
          </p>
        }
        troubleshootingTips={
          <p>
            If a decoded result looks wrong, check whether the input was actually encoded twice --
            decoding it a second time usually reveals the original text underneath. If a link isn't
            working after encoding, confirm reserved characters that are meaningful to the URL
            itself (like "/" or "?" in a path) weren't accidentally encoded when they needed to stay
            literal.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

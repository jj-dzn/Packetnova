import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
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
    >
      <ToolEducation
        howItWorks={
          <p>
            Pretty mode parses the JSON and re-serializes it with consistent indentation, so
            structure that was crammed onto one line becomes readable. Minify does the opposite --
            same data, every unnecessary whitespace character stripped -- which is what you actually
            want for a value being transmitted, not read by a person.
          </p>
        }
        whenToUseThis={
          <p>
            Reach for this when you've got JSON that's either unreadable (a minified API response
            you need to inspect) or wasteful (a config file about to be embedded somewhere size
            matters). Formatting also doubles as validation -- if it parses, it's syntactically
            correct JSON.
          </p>
        }
        commonMistakes={
          <p>
            The most common reasons JSON fails to parse: a trailing comma after the last item in an
            object or array (valid in JavaScript object literals, invalid in JSON), single quotes
            instead of double quotes around strings and keys, and unquoted keys -- all three are
            accepted by JavaScript's own object syntax but rejected by strict JSON, which is a
            frequent source of confusion when copying from JS source code.
          </p>
        }
        troubleshootingTips={
          <p>
            If validation fails, check the exact position the error message points to -- it's almost
            always the character right before or after a comma, quote, or bracket, not somewhere
            else in the document. Working with a large payload is easier if you narrow down the
            broken section first by testing smaller chunks.
          </p>
        }
        relatedReading={
          <p>
            Need to convert between formats?{' '}
            <Link to="/tools/yaml-formatter" className="text-accent hover:underline">
              YAML formatter
            </Link>{' '}
            converts YAML to and from JSON directly.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

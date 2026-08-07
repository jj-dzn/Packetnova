import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { CopyableTextarea } from '../CopyableTextarea'
import { JsonTreeView } from './JsonTreeView'
import { Pill } from '../../../components/ui/Pill'
import { formatJson } from '../../../lib/calculations/jsonFormatter'
import { useUrlState } from '../../../hooks/useUrlState'

function parseForTree(input: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(input) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON.' }
  }
}

const JQ_CLI: Record<'pretty' | 'minify' | 'tree', string> = {
  pretty: 'jq . input.json',
  minify: 'jq -c . input.json',
  tree: 'jq . input.json | less',
}

const VALID_JSON_MODES = new Set(['pretty', 'minify', 'tree'])

export function JsonFormatterTool() {
  const [modeParam, setMode] = useUrlState('mode', 'pretty')
  const mode = (VALID_JSON_MODES.has(modeParam) ? modeParam : 'pretty') as
    'pretty' | 'minify' | 'tree'
  const [input, setInput] = useUrlState(
    'json',
    '{"name":"PacketNova","tools":["subnet","cidr"],"free":true}',
  )
  const [showCli, setShowCli] = useState(false)

  // Re-parsing/re-formatting on every keystroke is fine for a short
  // snippet, but a large pasted JSON payload makes this a real cost worth
  // not repeating on every render for reasons unrelated to the input
  // itself (e.g. the CLI-snippet toggle).
  const result = useMemo(() => (mode === 'tree' ? null : formatJson(input, mode)), [input, mode])
  const treeResult = useMemo(() => (mode === 'tree' ? parseForTree(input) : null), [input, mode])

  return (
    <ToolPageLayout
      category="Utilities"
      title="JSON formatter"
      description="Format, validate, and minify JSON -- or explore it as a syntax-highlighted, foldable tree."
      status={(mode === 'tree' ? treeResult?.ok : result?.ok) ? 'ok' : 'error'}
      related={[
        { to: '/tools/yaml-formatter', label: 'YAML formatter' },
        { to: '/tools/xml-formatter', label: 'XML formatter' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Pill active={mode === 'pretty'} onClick={() => setMode('pretty')}>
              Pretty
            </Pill>
            <Pill active={mode === 'minify'} onClick={() => setMode('minify')}>
              Minify
            </Pill>
            <Pill active={mode === 'tree'} onClick={() => setMode('tree')}>
              Explore (tree)
            </Pill>
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
        <div className="flex flex-col gap-4">
          {mode === 'tree' ? (
            treeResult?.ok ? (
              <JsonTreeView value={treeResult.value} />
            ) : (
              <p className="text-sm text-danger">{treeResult?.error}</p>
            )
          ) : result?.ok ? (
            <CopyableTextarea value={result.result} rows={12} />
          ) : (
            <p className="text-sm text-danger">{result?.error}</p>
          )}
          <div>
            <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
              {showCli ? 'Hide' : 'Show'} jq equivalent (expert)
            </Pill>
            {showCli && (
              <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                {JQ_CLI[mode]}
              </pre>
            )}
          </div>
        </div>
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Pretty mode parses the JSON and re-serializes it with consistent indentation, so
            structure that was crammed onto one line becomes readable. Minify does the opposite --
            same data, every unnecessary whitespace character stripped -- which is what you actually
            want for a value being transmitted, not read by a person. Explore mode is different from
            both: it renders the same parsed data as a colored, foldable tree you can click through,
            for digging into a large or unfamiliar payload rather than reading it top to bottom.
          </p>
        }
        whenToUseThis={
          <p>
            Reach for Pretty or Minify when you've got JSON that's either unreadable (a minified API
            response you need to inspect) or wasteful (a config file about to be embedded somewhere
            size matters) -- both also double as validation, since a value that parses is
            syntactically correct JSON. Reach for Explore when the payload is large enough that
            reading it top to bottom isn't practical and you'd rather collapse the branches you
            don't care about.
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

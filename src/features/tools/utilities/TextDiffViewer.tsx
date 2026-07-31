import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { computeTextDiff } from '../../../lib/calculations/textDiff'

export function TextDiffViewer() {
  const [before, setBefore] = useState('subnet mask: 255.255.255.0\ngateway: 10.0.0.1\nvlan: 10\n')
  const [after, setAfter] = useState('subnet mask: 255.255.255.128\ngateway: 10.0.0.1\nvlan: 20\n')

  const calc = computeTextDiff(before, after)

  return (
    <ToolPageLayout
      category="Utilities"
      title="Text diff viewer"
      description="Compare two blocks of text and highlight the differences, line by line."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="diff-before" className="text-sm font-medium">
              Before
            </label>
            <textarea
              id="diff-before"
              value={before}
              onChange={(e) => setBefore(e.target.value)}
              rows={8}
              spellCheck={false}
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="diff-after" className="text-sm font-medium">
              After
            </label>
            <textarea
              id="diff-after"
              value={after}
              onChange={(e) => setAfter(e.target.value)}
              rows={8}
              spellCheck={false}
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <pre className="max-h-[28rem] overflow-auto rounded-md border border-border bg-bg p-3 font-mono text-sm">
            {calc.result.map((part, i) => (
              <span
                key={i}
                className={
                  part.added
                    ? 'block bg-success/15 text-success'
                    : part.removed
                      ? 'block bg-danger/15 text-danger line-through'
                      : 'block'
                }
              >
                {part.value}
              </span>
            ))}
          </pre>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

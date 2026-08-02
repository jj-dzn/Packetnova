import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
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
    >
      <ToolEducation
        howItWorks={
          <p>
            This compares the two blocks of text line by line and shows which lines were added,
            removed, or left unchanged -- an unchanged line means both blocks contain it in the same
            place; a changed line shows up as a removal of the old version plus an addition of the
            new one, rather than an in-place edit.
          </p>
        }
        whenToUseThis={
          <p>
            A genuinely useful, on-theme case for a networking toolkit: pasting a device's "before"
            and "after" running-config snapshots to see exactly what a change touched, without
            manually scanning two long config dumps for what moved. It's equally useful for any
            other two versions of text you need to compare -- code, prose, structured data.
          </p>
        }
        commonMistakes={
          <p>
            Comparing at the line level only means a single-word change inside an
            otherwise-identical line shows the entire line as removed-then-added, not just the
            changed word -- if a diff looks noisier than the actual edit was, that's why; read the
            full removed/added pair as one change, not two unrelated ones.
          </p>
        }
        troubleshootingTips={
          <p>
            If two lines that look identical still show as changed, check for invisible differences
            -- trailing whitespace, different line-ending characters, or a stray tab where you
            expect a space. Those are byte-different even when they render the same on screen.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

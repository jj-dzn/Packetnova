import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Pill } from '../../../components/ui/Pill'
import {
  computeTextDiff,
  summarizeDiff,
  type DiffGranularity,
  type DiffPart,
} from '../../../lib/calculations/textDiff'

type View = 'unified' | 'side-by-side'

function partClassName(part: DiffPart): string {
  if (part.added) return 'bg-success/15 text-success'
  if (part.removed) return 'bg-danger/15 text-danger line-through'
  return ''
}

function UnifiedDiff({ parts }: { parts: DiffPart[] }) {
  return (
    <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-bg p-3 font-mono text-sm">
      {parts.map((part, i) => (
        <span key={i} className={partClassName(part)}>
          {part.value}
        </span>
      ))}
    </pre>
  )
}

// A cheap but useful split view: each column independently keeps the parts
// relevant to it (unchanged parts in both, removed only on the left, added
// only on the right) and lets its own retained newlines wrap it -- not a
// true line-aligned diff (the two columns' line counts can drift apart
// around a change), but for the common case of small, localized edits the
// two sides land close enough to compare side by side.
function SideBySideDiff({ parts }: { parts: DiffPart[] }) {
  const leftParts = parts.filter((part) => !part.added)
  const rightParts = parts.filter((part) => !part.removed)

  return (
    <div className="grid max-h-[28rem] grid-cols-2 gap-2 overflow-auto">
      <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-bg p-3 font-mono text-sm">
        {leftParts.map((part, i) => (
          <span key={i} className={partClassName(part)}>
            {part.value}
          </span>
        ))}
      </pre>
      <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-bg p-3 font-mono text-sm">
        {rightParts.map((part, i) => (
          <span key={i} className={partClassName(part)}>
            {part.value}
          </span>
        ))}
      </pre>
    </div>
  )
}

export function TextDiffViewer() {
  const [before, setBefore] = useState('subnet mask: 255.255.255.0\ngateway: 10.0.0.1\nvlan: 10\n')
  const [after, setAfter] = useState('subnet mask: 255.255.255.128\ngateway: 10.0.0.1\nvlan: 20\n')
  const [granularity, setGranularity] = useState<DiffGranularity>('line')
  const [view, setView] = useState<View>('unified')

  const calc = computeTextDiff(before, after, granularity)
  const summary = calc.ok ? summarizeDiff(calc.result, granularity) : null

  return (
    <ToolPageLayout
      category="Utilities"
      title="Text diff viewer"
      description="Compare two blocks of text and highlight the differences, line by line or word by word."
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Pill active={granularity === 'line'} onClick={() => setGranularity('line')}>
                  Lines
                </Pill>
                <Pill active={granularity === 'word'} onClick={() => setGranularity('word')}>
                  Words
                </Pill>
              </div>
              <div className="flex gap-2">
                <Pill active={view === 'unified'} onClick={() => setView('unified')}>
                  Unified
                </Pill>
                <Pill active={view === 'side-by-side'} onClick={() => setView('side-by-side')}>
                  Side by side
                </Pill>
              </div>
            </div>
            {summary && (
              <p className="text-xs text-fg-muted">
                <span className="font-medium text-success">+{summary.added}</span>{' '}
                <span className="font-medium text-danger">-{summary.removed}</span>{' '}
                {granularity === 'word' ? 'words' : 'lines'} changed
              </p>
            )}
            {view === 'unified' ? (
              <UnifiedDiff parts={calc.result} />
            ) : (
              <SideBySideDiff parts={calc.result} />
            )}
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            This compares the two blocks of text and shows which lines (or, in word mode, which
            individual words) were added, removed, or left unchanged. In line mode, a changed line
            shows up as a removal of the old version plus an addition of the new one rather than an
            in-place edit; word mode narrows that down to just the words that actually differ inside
            an otherwise-identical line.
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
            Reading a line-mode diff as if the removed/added pair around a single-word change were
            two unrelated edits rather than one -- switch to word mode when a diff looks noisier
            than the actual change was, so only the word that actually changed gets highlighted.
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

import { useRef, useState, type UIEvent } from 'react'
import { CopyButton } from '../../../components/ui/CopyButton'
import {
  buildAlignedDiffRows,
  diffLineWords,
  summarizeAlignedRows,
  type AlignedDiffRow,
} from '../../../lib/calculations/textDiff'

interface DiffPasteBoardProps {
  before: string
  after: string
  onBeforeChange: (value: string) => void
  onAfterChange: (value: string) => void
}

type Side = 'left' | 'right'

const PANE_HEIGHT = 'h-[28rem]'

function rowTone(row: AlignedDiffRow, side: Side): string {
  if (row.type === 'same') return ''
  if (row.type === 'modified') return 'bg-warning/10'
  if (row.type === 'added') return side === 'right' ? 'bg-success/10' : 'bg-fg-subtle/5'
  return side === 'left' ? 'bg-danger/10' : 'bg-fg-subtle/5' // removed
}

// Only a 'modified' row's two lines are worth diffing against each other --
// same/added/removed rows are already fully meaningful at the line level,
// and there's no "other side" of the same content to compare against.
function ModifiedLineContent({ row, side }: { row: AlignedDiffRow; side: Side }) {
  const parts = diffLineWords(row.leftText ?? '', row.rightText ?? '')
  const relevant = side === 'left' ? parts.filter((p) => !p.added) : parts.filter((p) => !p.removed)
  const highlightClass = side === 'left' ? 'bg-danger/25' : 'bg-success/25'

  return (
    <>
      {relevant.map((part, i) => (
        <span key={i} className={part.added || part.removed ? highlightClass : undefined}>
          {part.value}
        </span>
      ))}
    </>
  )
}

function PaneRow({ row, side }: { row: AlignedDiffRow; side: Side }) {
  const number = side === 'left' ? row.leftNumber : row.rightNumber
  const text = side === 'left' ? row.leftText : row.rightText

  return (
    <div className={`flex ${rowTone(row, side)}`}>
      <span className="w-10 shrink-0 select-none border-r border-border px-2 py-0.5 text-right font-mono text-xs text-fg-subtle">
        {number ?? ''}
      </span>
      <span className="flex-1 whitespace-pre px-2 py-0.5 font-mono text-xs">
        {text === null ? (
          ' '
        ) : row.type === 'modified' ? (
          <ModifiedLineContent row={row} side={side} />
        ) : (
          text
        )}
      </span>
    </div>
  )
}

interface PaneProps {
  label: string
  value: string
  onChange: (value: string) => void
  rows: AlignedDiffRow[]
  side: Side
  scrollRef: React.RefObject<HTMLDivElement | null>
  onScroll: (event: UIEvent<HTMLDivElement>) => void
}

// Each pane is simultaneously the paste target and the diff display --
// exactly one box per side instead of a raw input box plus a separate
// read-only comparison box duplicating the same text. Editing and display
// are two different views of the same underlying state, not two different
// elements: click "Edit" (or click into an empty pane) to get a plain
// textarea for typing/pasting, and blurring it renders that same content
// back as the line-numbered, diff-highlighted view.
function Pane({ label, value, onChange, rows, side, scrollRef, onScroll }: PaneProps) {
  const [editing, setEditing] = useState(false)
  const isEmpty = value === ''

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <div className="flex items-center gap-2">
          {!editing && !isEmpty && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-fg-subtle hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Edit
            </button>
          )}
          {!isEmpty && <CopyButton value={value} label={label} />}
        </div>
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          spellCheck={false}
          wrap="off"
          className={`${PANE_HEIGHT} w-full resize-none rounded-md border border-accent bg-bg p-3 font-mono text-xs text-fg outline-none`}
        />
      ) : isEmpty ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`${PANE_HEIGHT} flex w-full items-center justify-center rounded-md border border-dashed border-border bg-bg text-sm text-fg-subtle transition-colors hover:border-accent/40 hover:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}
        >
          Click to paste text
        </button>
      ) : (
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className={`${PANE_HEIGHT} overflow-auto rounded-md border border-border bg-bg`}
        >
          <div className="min-w-max">
            {rows.map((row, i) => (
              <PaneRow key={i} row={row} side={side} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// A Notepad++/GitHub-style split diff that's also the paste target: both
// panes render the exact same row list (blanks standing in wherever a line
// doesn't exist on that side) so they're pixel-aligned without layout
// trickery, kept in sync while scrolling via scrollTop, and each side owns
// its own textarea so pasting into one updates its diff highlighting -- and
// the other pane's, since both are recomputed from the same before/after
// state -- without disturbing what's in the other box.
export function DiffPasteBoard({
  before,
  after,
  onBeforeChange,
  onAfterChange,
}: DiffPasteBoardProps) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

  const aligned = buildAlignedDiffRows(before, after)
  const rows = aligned.ok ? aligned.result : []
  const summary = aligned.ok ? summarizeAlignedRows(rows) : null

  function handleLeftScroll(event: UIEvent<HTMLDivElement>) {
    if (syncing.current) {
      syncing.current = false
      return
    }
    if (rightRef.current) {
      syncing.current = true
      rightRef.current.scrollTop = event.currentTarget.scrollTop
    }
  }

  function handleRightScroll(event: UIEvent<HTMLDivElement>) {
    if (syncing.current) {
      syncing.current = false
      return
    }
    if (leftRef.current) {
      syncing.current = true
      leftRef.current.scrollTop = event.currentTarget.scrollTop
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {summary && (
        <p className="text-xs text-fg-muted">
          <span className="font-medium text-success">+{summary.added}</span>{' '}
          <span className="font-medium text-danger">-{summary.removed}</span>{' '}
          <span className="font-medium text-warning">~{summary.modified}</span> lines changed
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Pane
          label="Text 1 (before)"
          value={before}
          onChange={onBeforeChange}
          rows={rows}
          side="left"
          scrollRef={leftRef}
          onScroll={handleLeftScroll}
        />
        <Pane
          label="Text 2 (after)"
          value={after}
          onChange={onAfterChange}
          rows={rows}
          side="right"
          scrollRef={rightRef}
          onScroll={handleRightScroll}
        />
      </div>
    </div>
  )
}

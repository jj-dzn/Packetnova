import { forwardRef, useRef, type UIEvent } from 'react'
import { CopyButton } from '../../../components/ui/CopyButton'
import { diffLineWords, type AlignedDiffRow } from '../../../lib/calculations/textDiff'

interface SideBySideLineDiffProps {
  before: string
  after: string
  rows: AlignedDiffRow[]
}

type Side = 'left' | 'right'

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
  // On the left, anything highlighted here is a removed word by
  // definition (added words were just filtered out above), and vice
  // versa on the right -- so the tone can key off `side` alone, keeping
  // the same red-removed/green-added convention used everywhere else in
  // this tool.
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
          ' '
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
  copyValue: string
  rows: AlignedDiffRow[]
  side: Side
  onScroll: (event: UIEvent<HTMLDivElement>) => void
}

// forwardRef so the parent can drive scroll-sync directly on the DOM node --
// each pane is otherwise a fully independent, natively-selectable block of
// text, exactly so a visitor can drag-select and copy just one side without
// picking up the other side's lines in the same selection.
const Pane = forwardRef<HTMLDivElement, PaneProps>(function Pane(
  { label, copyValue, rows, side, onScroll },
  ref,
) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        <CopyButton value={copyValue} label={label} />
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="max-h-[28rem] overflow-auto rounded-md border border-border bg-bg"
      >
        <div className="min-w-max">
          {rows.map((row, i) => (
            <PaneRow key={i} row={row} side={side} />
          ))}
        </div>
      </div>
    </div>
  )
})

// A Notepad++/GitHub-style split diff: both panes render the exact same
// row list (blanks standing in wherever a line doesn't exist on that side),
// so they're pixel-aligned without needing any layout trickery -- the only
// thing keeping them visually in lockstep while scrolling is syncing
// scrollTop between the two independent scroll containers. The `syncing`
// guard flag stops that from becoming an infinite ping-pong: a
// programmatic scrollTop write fires its own 'scroll' event, which would
// otherwise immediately bounce back and try to re-sync the pane that just
// caused the update.
export function SideBySideLineDiff({ before, after, rows }: SideBySideLineDiffProps) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)

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
    <div className="grid grid-cols-2 gap-3">
      <Pane
        ref={leftRef}
        label="Before"
        copyValue={before}
        rows={rows}
        side="left"
        onScroll={handleLeftScroll}
      />
      <Pane
        ref={rightRef}
        label="After"
        copyValue={after}
        rows={rows}
        side="right"
        onScroll={handleRightScroll}
      />
    </div>
  )
}

import { useRef, type RefObject, type UIEvent } from 'react'
import { CopyButton } from '../../../components/ui/CopyButton'
import {
  buildAlignedDiffRows,
  computeOverlayLines,
  diffLineWords,
  summarizeAlignedRows,
  type OverlayLine,
} from '../../../lib/calculations/textDiff'

interface DiffPasteBoardProps {
  before: string
  after: string
  onBeforeChange: (value: string) => void
  onAfterChange: (value: string) => void
}

type Side = 'left' | 'right'

// Both layers share these exact values so the invisible text in the
// textarea lines up, character for character, with the visible colored
// duplicate rendered right underneath it.
const PANE_HEIGHT = 'h-[28rem]'
const LINE_HEIGHT_PX = 20
const GUTTER_WIDTH_PX = 40
const BASE_PADDING_PX = 12

function lineTone(status: OverlayLine['status']): string {
  if (status === 'modified') return 'bg-warning/10'
  if (status === 'removed') return 'bg-danger/10'
  if (status === 'added') return 'bg-success/10'
  return ''
}

// Only a 'modified' line's pair is worth diffing at the word level --
// same/added/removed lines are already fully meaningful on their own.
function OverlayLineText({ line, side }: { line: OverlayLine; side: Side }) {
  if (line.status !== 'modified' || !line.modifiedPair) return <>{line.text}</>

  const parts = diffLineWords(line.modifiedPair.beforeText, line.modifiedPair.afterText)
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

// The visible, colored duplicate of the text sitting directly underneath
// the transparent textarea -- pointer-events-none so every click/drag/type
// passes straight through to the real textarea above it. Its own line
// count always matches the textarea's real line count exactly (no filler
// rows), which is what keeps this overlay technique from drifting: unlike
// the read-only comparison view this replaced, there is no room here to
// pad one side with blank rows, since that would desync the invisible
// cursor from the visible text it's supposed to be sitting on top of.
function Overlay({ lines, side }: { lines: OverlayLine[]; side: Side }) {
  return (
    <div className="min-w-max">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`flex whitespace-pre ${lineTone(line.status)}`}
          style={{ height: LINE_HEIGHT_PX, lineHeight: `${LINE_HEIGHT_PX}px` }}
        >
          <span
            className="shrink-0 select-none pr-2 text-right text-fg-subtle"
            style={{ width: GUTTER_WIDTH_PX }}
          >
            {i + 1}
          </span>
          <span>
            <OverlayLineText line={line} side={side} />
          </span>
        </div>
      ))}
    </div>
  )
}

interface PaneProps {
  label: string
  value: string
  onChange: (value: string) => void
  lines: OverlayLine[]
  side: Side
  textareaRef: RefObject<HTMLTextAreaElement | null>
  overlayRef: RefObject<HTMLDivElement | null>
  onScroll: (event: UIEvent<HTMLTextAreaElement>) => void
}

// Each pane is always a real, directly-typeable textarea -- no separate
// "click Edit first" step -- with the diff-highlighted rendering of that
// exact same text layered underneath it, so pasting or typing shows the
// comparison in place instead of requiring a mode switch to see it.
function Pane({
  label,
  value,
  onChange,
  lines,
  side,
  textareaRef,
  overlayRef,
  onScroll,
}: PaneProps) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-fg-muted">{label}</span>
        {value !== '' && <CopyButton value={value} label={label} />}
      </div>
      <div
        className={`relative ${PANE_HEIGHT} overflow-hidden rounded-md border border-border bg-bg`}
      >
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="pn-no-scrollbar pointer-events-none absolute inset-0 overflow-auto font-mono text-xs"
          style={{ padding: BASE_PADDING_PX }}
        >
          <Overlay lines={lines} side={side} />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={onScroll}
          placeholder="Paste text here..."
          spellCheck={false}
          wrap="off"
          className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent font-mono text-xs text-transparent caret-fg outline-none placeholder:text-fg-subtle"
          style={{
            padding: BASE_PADDING_PX,
            paddingLeft: BASE_PADDING_PX + GUTTER_WIDTH_PX,
            lineHeight: `${LINE_HEIGHT_PX}px`,
          }}
        />
      </div>
    </div>
  )
}

// A GitHub-style split diff that's directly, immediately editable --
// pasting into either side updates both panes' highlighting live, with no
// mode to switch into first. Scroll position is synced two
// ways: each textarea drives its own overlay underneath it (so the
// highlighted duplicate always tracks what's actually on screen), and the
// two textareas drive each other (so the panes stay visually together
// while reviewing a long diff). Cross-pane sync is best-effort by pixel
// position rather than by logical line, since -- unlike the read-only view
// this replaced -- neither side is padded with blank rows to keep line
// counts matched, which a directly-editable textarea can't have without
// corrupting the real text.
export function DiffPasteBoard({
  before,
  after,
  onBeforeChange,
  onAfterChange,
}: DiffPasteBoardProps) {
  const leftTextareaRef = useRef<HTMLTextAreaElement>(null)
  const rightTextareaRef = useRef<HTMLTextAreaElement>(null)
  const leftOverlayRef = useRef<HTMLDivElement>(null)
  const rightOverlayRef = useRef<HTMLDivElement>(null)
  const syncingPanes = useRef(false)

  const aligned = buildAlignedDiffRows(before, after)
  const summary = aligned.ok ? summarizeAlignedRows(aligned.result) : null
  const { beforeLines, afterLines } = computeOverlayLines(before, after)

  function handleLeftScroll(event: UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = event.currentTarget
    if (leftOverlayRef.current) {
      leftOverlayRef.current.scrollTop = scrollTop
      leftOverlayRef.current.scrollLeft = scrollLeft
    }
    if (syncingPanes.current) {
      syncingPanes.current = false
      return
    }
    if (rightTextareaRef.current) {
      syncingPanes.current = true
      rightTextareaRef.current.scrollTop = scrollTop
    }
  }

  function handleRightScroll(event: UIEvent<HTMLTextAreaElement>) {
    const { scrollTop, scrollLeft } = event.currentTarget
    if (rightOverlayRef.current) {
      rightOverlayRef.current.scrollTop = scrollTop
      rightOverlayRef.current.scrollLeft = scrollLeft
    }
    if (syncingPanes.current) {
      syncingPanes.current = false
      return
    }
    if (leftTextareaRef.current) {
      syncingPanes.current = true
      leftTextareaRef.current.scrollTop = scrollTop
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
          lines={beforeLines}
          side="left"
          textareaRef={leftTextareaRef}
          overlayRef={leftOverlayRef}
          onScroll={handleLeftScroll}
        />
        <Pane
          label="Text 2 (after)"
          value={after}
          onChange={onAfterChange}
          lines={afterLines}
          side="right"
          textareaRef={rightTextareaRef}
          overlayRef={rightOverlayRef}
          onScroll={handleRightScroll}
        />
      </div>
    </div>
  )
}

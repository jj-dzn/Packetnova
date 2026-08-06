import { useState } from 'react'
import { useNotebook } from '../../hooks/useNotebook'
import { extractSummaryText } from '../../lib/notebook/extractSummaryText'

interface PinToNotebookButtonProps {
  href: string
  title: string
  category: string
  /** Called at click time, not render time, so the captured element always
   * reflects whatever's currently on screen instead of a stale closure. */
  getSummaryElement: () => HTMLElement | null
  className?: string
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M8 3h4l.5 5.5L15 11v1.5H5V11l2.5-2.5L8 3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M10 12.5V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const RESET_DELAY_MS = 1500

const buttonClass =
  'inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-accent/40 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

// Dropped into the shared tool/visualizer/scenario layouts, each pointing
// getSummary at whatever ref/state already represents that page's result --
// no per-tool wiring needed. Pins a plain-text snapshot into the sitewide
// notebook (see NotebookPage), independent of the result actually being
// valid -- an error message is still a legitimate thing to pin.
export function PinToNotebookButton({
  href,
  title,
  category,
  getSummaryElement,
  className = '',
}: PinToNotebookButtonProps) {
  const { pin } = useNotebook()
  const [justPinned, setJustPinned] = useState(false)

  function handlePin() {
    const element = getSummaryElement()
    const summary = element ? extractSummaryText(element).trim() : ''
    if (!summary) return
    pin({ href, title, category, summary })
    setJustPinned(true)
    window.setTimeout(() => setJustPinned(false), RESET_DELAY_MS)
  }

  return (
    <button type="button" onClick={handlePin} className={`${buttonClass} ${className}`}>
      <PinIcon />
      {justPinned ? 'Pinned' : 'Pin to notebook'}
    </button>
  )
}

const MAX_SUMMARY_LENGTH = 4000
const SHORT_LINE_MAX_CHARS = 2
const SHORT_RUN_COLLAPSE_THRESHOLD = 4

// The site's actual vocabulary of chrome/navigation button labels that can
// appear inside a result panel (StepControls, ExportButton, GuidedMode's
// toggle). Deliberately a narrow allowlist rather than "exclude every
// button" -- some tools use a real <button> to show a real data value (a
// bit-toggle sandbox's individual 1/0 cells), and blanket-excluding all
// button text would silently drop that data instead of just the chrome.
const CHROME_BUTTON_WORDS = new Set([
  'previous',
  'next',
  'play',
  'pause',
  'reset',
  'png',
  'svg',
  'export',
])

function isChromeButtonText(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    CHROME_BUTTON_WORDS.has(lower) ||
    lower.startsWith('show ') ||
    lower.startsWith('hide ') ||
    lower.startsWith('copy')
  )
}

// Captures a readable plain-text snapshot of a result panel for the
// notebook -- plain innerText alone pulls in every interactive control's
// own label too ("Previous", "PNG", "SVG", "Show guided walkthrough"), plus
// non-interactive chrome labels sitting next to them (ExportButton's
// "Export" caption, marked with data-notebook-chrome since it isn't a
// button itself), which reads as noise next to the actual result. Chrome
// text is excluded by exact-line match against each element's own live
// innerText, rather than cloning the element -- innerText on a
// detached/unrendered clone isn't reliable across browsers, since it
// depends on the real layout.
export function extractSummaryText(element: HTMLElement): string {
  const buttonTexts = new Set(
    Array.from(element.querySelectorAll('button, [role="button"], [data-notebook-chrome]'))
      .map((button) => (button as HTMLElement).innerText.trim())
      .filter((text) => text && isChromeButtonText(text)),
  )

  const lines = (element.innerText ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !buttonTexts.has(line))

  // A dense grid of short values (a bit-toggle sandbox, a table of
  // single-character cells) turns into dozens of near-empty lines under
  // innerText, one per cell -- collapse a long run of them onto one line
  // instead of leaving each its own line.
  const collapsed: string[] = []
  let shortRun: string[] = []
  const flushShortRun = () => {
    if (shortRun.length === 0) return
    collapsed.push(
      shortRun.length >= SHORT_RUN_COLLAPSE_THRESHOLD ? shortRun.join(' ') : shortRun.join('\n'),
    )
    shortRun = []
  }
  for (const line of lines) {
    if (line.length <= SHORT_LINE_MAX_CHARS) {
      shortRun.push(line)
    } else {
      flushShortRun()
      collapsed.push(line)
    }
  }
  flushShortRun()

  const result = collapsed.join('\n')
  return result.length > MAX_SUMMARY_LENGTH
    ? `${result.slice(0, MAX_SUMMARY_LENGTH)}\n... (truncated)`
    : result
}

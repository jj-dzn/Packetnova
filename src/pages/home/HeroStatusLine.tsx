import { useEffect, useState } from 'react'
import { TerminalCursor } from '../../components/ui/TerminalCursor'
import { LatencyOrb } from './LatencyOrb'

const STATUS_TEXT = 'nova core online -- all systems nominal'
const TYPE_INTERVAL_MS = 55

// Types itself out on load so the hero already feels "in progress" within
// the first couple seconds, with no click required. Reduced-motion visitors
// get the finished line immediately instead of the typing animation.
export function HeroStatusLine() {
  const [charCount, setCharCount] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? STATUS_TEXT.length : 0,
  )

  useEffect(() => {
    if (charCount >= STATUS_TEXT.length) return
    const timer = window.setTimeout(() => setCharCount((count) => count + 1), TYPE_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [charCount])

  return (
    <p className="flex items-center gap-2 font-mono text-xs text-fg-subtle">
      <LatencyOrb />
      <span>
        {STATUS_TEXT.slice(0, charCount)}
        <TerminalCursor className="ml-0.5" />
      </span>
    </p>
  )
}

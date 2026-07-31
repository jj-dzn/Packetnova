interface TerminalCursorProps {
  className?: string
}

// Shared hard on/off blink so the same cursor motif reads identically
// everywhere it shows up -- the hero status line and the retro terminal
// both use this instead of each rolling their own.
export function TerminalCursor({ className = '' }: TerminalCursorProps) {
  return (
    <span aria-hidden="true" className={`motion-safe:animate-pn-cursor-blink ${className}`}>
      _
    </span>
  )
}

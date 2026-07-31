import type { ReactNode } from 'react'

interface AsideProps {
  children: ReactNode
}

// A distinct "did you know" callout for trivia/gotchas that aren't specific
// to the current input -- as opposed to a plain <p> note, which is for
// facts about the actual computed result. Visually separate so it reads as
// a bonus, not just more result text.
export function Aside({ children }: AsideProps) {
  return (
    <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2 text-xs text-fg-muted">
      <span className="font-medium text-accent">Did you know? </span>
      {children}
    </div>
  )
}

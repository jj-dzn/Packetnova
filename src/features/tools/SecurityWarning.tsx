import type { ReactNode } from 'react'

interface SecurityWarningProps {
  children: ReactNode
}

// A loud, unmissable callout for a real, detected problem with the current
// input -- distinct from Aside (informational trivia unrelated to what was
// typed) and Badge (a short status label). This is for "this specific
// token/certificate has a real issue," so it renders as a full block in
// danger colors, not a quiet row, and announces itself to screen readers
// since it can appear or disappear as the user types.
export function SecurityWarning({ children }: SecurityWarningProps) {
  return (
    <div
      role="alert"
      className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
    >
      <span className="font-medium">Warning: </span>
      {children}
    </div>
  )
}

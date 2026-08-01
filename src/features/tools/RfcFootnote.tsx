import type { ReactNode } from 'react'

// A consistent, low-key citation line for reference tools -- the RFC number
// was often already known (see the source comments in several content/
// reference/*.ts files) but never actually shown to a visitor.
export function RfcFootnote({ children }: { children: ReactNode }) {
  return <p className="mt-6 border-t border-border pt-4 text-xs text-fg-subtle">{children}</p>
}

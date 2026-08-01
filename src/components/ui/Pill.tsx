import type { ButtonHTMLAttributes } from 'react'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
}

// Shared toggle-pill button -- mode switches, scenario/version pickers,
// category filters. Consolidates what had drifted into ~11 near-identical
// inline className copies across the site, none of which had a visible
// focus ring for keyboard users.
export function Pill({ active, className = '', type = 'button', ...props }: PillProps) {
  return (
    <button
      type={type}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-fg-muted hover:border-accent/40 hover:text-fg'
      } ${className}`}
      {...props}
    />
  )
}

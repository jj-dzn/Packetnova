import type { HTMLAttributes } from 'react'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'border-border bg-surface text-fg-muted',
  accent: 'border-accent/40 bg-accent/10 text-accent',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
}

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${toneStyles[tone]} ${className}`}
      {...props}
    />
  )
}

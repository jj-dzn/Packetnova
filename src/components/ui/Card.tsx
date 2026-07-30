import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function Card({ interactive = false, className = '', ...props }: CardProps) {
  const interactiveStyles = interactive
    ? 'transition-all duration-150 hover:border-accent hover:shadow-[0_0_24px_-10px_var(--color-accent)]'
    : ''

  return (
    <div
      className={`rounded-lg border border-border bg-surface p-5 ${interactiveStyles} ${className}`}
      {...props}
    />
  )
}

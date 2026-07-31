import type { SelectHTMLAttributes } from 'react'

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg transition-shadow duration-150 focus:border-accent focus:shadow-[0_0_16px_-6px_var(--color-accent)] focus:outline-none ${className}`}
      {...props}
    />
  )
}

import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle transition-shadow duration-150 focus:border-accent focus:shadow-[0_0_16px_-6px_var(--color-accent)] focus:outline-none ${className}`}
      {...props}
    />
  )
}

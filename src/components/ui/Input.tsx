import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none ${className}`}
      {...props}
    />
  )
}

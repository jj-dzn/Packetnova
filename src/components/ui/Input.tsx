import type { InputHTMLAttributes } from 'react'

// Tailwind's generated stylesheet orders utilities by its own internal
// scale, not by source position -- `.w-full` ends up defined after
// `.w-20`/`.w-24`/etc regardless of which one appears later in a
// className string, so a hardcoded `w-full` here would silently beat any
// narrower width a caller passes. Only default to full width when the
// caller hasn't specified a width utility of their own.
const WIDTH_CLASS_PATTERN = /(?:^|\s)w-\S/

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const widthClass = WIDTH_CLASS_PATTERN.test(className) ? '' : 'w-full'
  return (
    <input
      className={`${widthClass} rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle transition-shadow duration-150 focus:border-accent focus:shadow-[0_0_16px_-6px_var(--color-accent)] focus:outline-none ${className}`}
      {...props}
    />
  )
}

import type { SelectHTMLAttributes } from 'react'

// Same width-override fix as Input.tsx -- see the comment there for why a
// bare `w-full` in the base classes would always beat a caller's narrower
// width class regardless of source order.
const WIDTH_CLASS_PATTERN = /(?:^|\s)w-\S/

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const widthClass = WIDTH_CLASS_PATTERN.test(className) ? '' : 'w-full'
  return (
    <select
      className={`${widthClass} rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg transition-shadow duration-150 focus:border-accent focus:shadow-[0_0_16px_-6px_var(--color-accent)] focus:outline-none ${className}`}
      {...props}
    />
  )
}

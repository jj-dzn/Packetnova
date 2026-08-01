import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const baseStyles =
  'relative inline-flex items-center justify-center overflow-hidden rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'group bg-accent text-white shadow-[0_0_0_1px_rgba(139,124,255,0.35),0_0_24px_-6px_var(--color-accent)] hover:brightness-110',
  secondary: 'border border-border bg-surface text-fg hover:border-accent hover:text-accent',
}

// A single light sweep across the button on hover -- the same diagonal
// gradient-sweep technique as the page-transition shimmer (pn-page-shimmer
// in index.css), just re-triggered per hover instead of once on page load,
// so the two read as related rather than coincidentally similar. Primary
// only: this is the "glowing" button tier, secondary stays quiet.
function ButtonShine() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full motion-reduce:hidden"
    />
  )
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
      {variant === 'primary' && <ButtonShine />}
    </button>
  )
}

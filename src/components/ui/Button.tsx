import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const baseStyles =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-[0_0_0_1px_rgba(139,124,255,0.35),0_0_24px_-6px_var(--color-accent)] hover:brightness-110',
  secondary: 'border border-border bg-surface text-fg hover:border-accent hover:text-accent',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props} />
}

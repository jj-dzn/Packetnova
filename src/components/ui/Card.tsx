import { useRef, type HTMLAttributes, type MouseEvent } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  /** Subtle pointer-following 3D tilt. Only meaningful alongside `interactive`. */
  tilt?: boolean
}

const MAX_TILT_DEG = 2.5

export function Card({
  interactive = false,
  tilt = false,
  className = '',
  onMouseMove,
  onMouseLeave,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    onMouseMove?.(event)
    if (!tilt || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = (event.clientX - rect.left) / rect.width - 0.5
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5
    ref.current.style.setProperty('--pn-tilt-x', `${(-offsetY * MAX_TILT_DEG).toFixed(2)}deg`)
    ref.current.style.setProperty('--pn-tilt-y', `${(offsetX * MAX_TILT_DEG).toFixed(2)}deg`)
  }

  function handleMouseLeave(event: MouseEvent<HTMLDivElement>) {
    onMouseLeave?.(event)
    if (!ref.current) return
    ref.current.style.setProperty('--pn-tilt-x', '0deg')
    ref.current.style.setProperty('--pn-tilt-y', '0deg')
  }

  const interactiveStyles = interactive
    ? 'transition-all duration-150 hover:border-accent hover:shadow-[0_0_24px_-10px_var(--color-accent)]'
    : ''
  const tiltStyles = tilt
    ? 'transition-transform duration-200 ease-out [transform:perspective(1400px)_rotateX(var(--pn-tilt-x,0deg))_rotateY(var(--pn-tilt-y,0deg))]'
    : ''

  return (
    <div
      ref={ref}
      onMouseMove={tilt ? handleMouseMove : onMouseMove}
      onMouseLeave={tilt ? handleMouseLeave : onMouseLeave}
      className={`rounded-lg border border-border bg-surface p-5 ${interactiveStyles} ${tiltStyles} ${className}`}
      {...props}
    />
  )
}

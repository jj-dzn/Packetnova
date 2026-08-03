interface SkeletonProps {
  className?: string
}

// A single pulsing placeholder bar -- the same animate-pulse language
// RouteLoadingFallback already uses for "something's being computed,"
// sized for inline use inside a result row instead of a whole page.
// bg-fg-subtle/15 rather than bg-surface: this renders inside panels that
// are themselves bg-surface, so matching that would make the skeleton
// invisible against its own container.
export function Skeleton({ className = 'h-4 w-24' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-pulse rounded bg-fg-subtle/15 ${className}`}
    />
  )
}

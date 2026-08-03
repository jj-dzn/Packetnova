import { useEffect, useState } from 'react'

// Shared reduced-motion check -- anything driving a CSS animation via
// inline style (a dynamically-computed duration, so it can't just rely on
// Tailwind's `motion-safe:` class variant) needs this to suppress the
// animation itself under prefers-reduced-motion, the same way useStepPlayer
// already withholds auto-play.
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(query.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}

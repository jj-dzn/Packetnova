import { useEffect, useRef, useState, type RefObject } from 'react'

// One-shot fade/slide-in when a section first scrolls into view -- for
// below-the-fold homepage sections that currently render eagerly with no
// entrance treatment. Starts already "revealed" under prefers-reduced-motion
// (skips the IntersectionObserver entirely) so those visitors never see a
// hidden-then-appearing section; everyone else gets it once, the observer
// disconnects after the first trigger rather than toggling on every scroll
// past the boundary.
export function useScrollReveal<T extends HTMLElement>(): {
  ref: RefObject<T | null>
  revealed: boolean
} {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (revealed) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [revealed])

  return { ref, revealed }
}

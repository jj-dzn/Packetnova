import { useEffect, useRef } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function useKonamiCode(onMatch: () => void) {
  const progressRef = useRef(0)
  const onMatchRef = useRef(onMatch)

  useEffect(() => {
    onMatchRef.current = onMatch
  }, [onMatch])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const expected = KONAMI_SEQUENCE[progressRef.current]

      if (key === expected) {
        progressRef.current += 1
        if (progressRef.current === KONAMI_SEQUENCE.length) {
          progressRef.current = 0
          onMatchRef.current()
        }
      } else {
        progressRef.current = key === KONAMI_SEQUENCE[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

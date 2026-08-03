import { useEffect, useState, type KeyboardEvent } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

const AUTO_ADVANCE_MS = 1600

export interface StepPlayer {
  step: number
  isFirst: boolean
  isLast: boolean
  isPlaying: boolean
  /** Auto-play is withheld entirely under prefers-reduced-motion -- manual
   * stepping (still fully keyboard/mouse operable) is the fallback. */
  canAutoPlay: boolean
  next: () => void
  previous: () => void
  reset: () => void
  togglePlay: () => void
  /** Jump directly to a step -- e.g. clicking a specific layer in an explorer. */
  goTo: (index: number) => void
  onKeyDown: (event: KeyboardEvent) => void
}

export function useStepPlayer(totalSteps: number): StepPlayer {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const canAutoPlay = !prefersReducedMotion

  const isFirst = step === 0
  const isLast = step === totalSteps - 1

  const next = () => setStep((current) => Math.min(current + 1, totalSteps - 1))
  const previous = () => {
    setIsPlaying(false)
    setStep((current) => Math.max(current - 1, 0))
  }
  const reset = () => {
    setIsPlaying(false)
    setStep(0)
  }
  const goTo = (index: number) => {
    setIsPlaying(false)
    setStep(Math.min(Math.max(index, 0), totalSteps - 1))
  }
  const togglePlay = () => {
    if (!canAutoPlay) return
    setIsPlaying((playing) => {
      if (!playing && step === totalSteps - 1) setStep(0)
      return !playing
    })
  }

  useEffect(() => {
    if (!isPlaying || !canAutoPlay) return
    const id = window.setInterval(() => {
      setStep((current) => {
        if (current >= totalSteps - 1) {
          setIsPlaying(false)
          return current
        }
        return current + 1
      })
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [isPlaying, canAutoPlay, totalSteps])

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      previous()
    } else if (event.key === ' ' && canAutoPlay) {
      event.preventDefault()
      togglePlay()
    }
  }

  return {
    step,
    isFirst,
    isLast,
    isPlaying,
    canAutoPlay,
    next,
    previous,
    reset,
    togglePlay,
    goTo,
    onKeyDown,
  }
}

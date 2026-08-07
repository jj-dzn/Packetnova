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
  const [rawStep, setRawStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const canAutoPlay = !prefersReducedMotion

  // next()/goTo()/previous() only clamp at the moment they're called -- if
  // the caller's own step count shrinks out from under an already-advanced
  // player (e.g. editing a tool's inputs mid-walkthrough drops the guided
  // step count), nothing else re-clamps the raw state. Clamped again here,
  // on every render, rather than via an effect -- an effect would still
  // let one render through with a stale, out-of-range step first.
  const step = Math.min(rawStep, Math.max(totalSteps - 1, 0))

  const isFirst = step === 0
  const isLast = step === totalSteps - 1

  const next = () => setRawStep((current) => Math.min(current + 1, totalSteps - 1))
  const previous = () => {
    setIsPlaying(false)
    setRawStep((current) => Math.max(current - 1, 0))
  }
  const reset = () => {
    setIsPlaying(false)
    setRawStep(0)
  }
  const goTo = (index: number) => {
    setIsPlaying(false)
    setRawStep(Math.min(Math.max(index, 0), totalSteps - 1))
  }
  const togglePlay = () => {
    if (!canAutoPlay) return
    setIsPlaying((playing) => {
      if (!playing && step === totalSteps - 1) setRawStep(0)
      return !playing
    })
  }

  useEffect(() => {
    if (!isPlaying || !canAutoPlay) return
    const id = window.setInterval(() => {
      setRawStep((current) => {
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

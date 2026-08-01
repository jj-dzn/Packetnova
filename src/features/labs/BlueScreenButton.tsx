import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'

const ERROR_CODES = [
  'PACKET_LOSS_EXCEEDED_EXPECTATIONS',
  'TOO_MANY_TABS_OPEN',
  'ROUTING_LOOP_DETECTED_AGAIN',
  'CHECKSUM_DISAGREED_WITH_VIBES',
  'MTU_TOO_SMALL_FOR_THIS_ENERGY',
]

const DISMISS_AFTER_MS = 4500

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function BlueScreenButton() {
  const [visible, setVisible] = useState(false)
  const [percent, setPercent] = useState(0)
  const [errorCode, setErrorCode] = useState(() => pick(ERROR_CODES))
  const intervalRef = useRef<number | undefined>(undefined)
  const dismissTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearInterval(intervalRef.current)
      window.clearTimeout(dismissTimeoutRef.current)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    window.clearInterval(intervalRef.current)
    window.clearTimeout(dismissTimeoutRef.current)
  }

  function trigger() {
    setErrorCode(pick(ERROR_CODES))
    setPercent(0)
    setVisible(true)

    intervalRef.current = window.setInterval(() => {
      setPercent((current) => {
        const next = Math.min(100, current + Math.random() * 12)
        if (next >= 100) window.clearInterval(intervalRef.current)
        return next
      })
    }, 120)

    dismissTimeoutRef.current = window.setTimeout(dismiss, DISMISS_AFTER_MS)
  }

  useEffect(() => {
    if (!visible) return
    function handleKeyDown() {
      dismiss()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible])

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">The blue screen button</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Push it. Watch PacketNova "crash." It recovers on its own, or press any key to skip.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-16 text-center">
        <button
          type="button"
          onClick={trigger}
          className="h-24 w-24 rounded-full bg-danger text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_32px_-6px_var(--color-danger)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          DO NOT PRESS
        </button>
      </Card>

      {visible && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a1a8f] p-8 font-mono text-white"
          onClick={dismiss}
          role="alertdialog"
          aria-label="Fake crash screen"
        >
          <div className="max-w-lg">
            <p className="text-4xl">:(</p>
            <p className="mt-6 text-lg">
              PacketNova ran into a problem and needs to pretend to restart.
            </p>
            <p className="mt-4 text-sm text-white/80">
              We're just collecting some vibes before continuing.
            </p>
            <p className="mt-6 text-sm">{Math.floor(percent)}% complete</p>
            <p className="mt-8 text-xs text-white/60">Error code: {errorCode}</p>
            <p className="mt-8 text-xs text-white/60">Click anywhere, or press any key, to skip.</p>
          </div>
        </div>
      )}
    </div>
  )
}

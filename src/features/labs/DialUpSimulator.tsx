import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { createAudioContext, DIAL_UP_PHASES, playDialUpSequence } from '../../lib/labs/dialUp'

type Status = 'idle' | 'connecting' | 'connected'

export function DialUpSimulator() {
  const [status, setStatus] = useState<Status>('idle')
  const [phaseIndex, setPhaseIndex] = useState(0)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  function connect() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []

    const ctx = createAudioContext()
    if (ctx) playDialUpSequence(ctx)

    setStatus('connecting')
    setPhaseIndex(0)

    let elapsed = 0
    DIAL_UP_PHASES.forEach((_phase, index) => {
      if (index === 0) return
      elapsed += DIAL_UP_PHASES[index - 1]!.durationMs
      const id = window.setTimeout(() => {
        setPhaseIndex(index)
        if (index === DIAL_UP_PHASES.length - 1) setStatus('connected')
      }, elapsed)
      timeoutsRef.current.push(id)
    })
  }

  function disconnect() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
    setStatus('idle')
    setPhaseIndex(0)
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Fun Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Dial-up simulator</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Relive the screech of a 56k modem connecting to the internet. Turn your volume up.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-12 text-center">
        {status === 'idle' && <Button onClick={connect}>Connect</Button>}

        {status === 'connecting' && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="font-mono text-sm text-fg-muted">{DIAL_UP_PHASES[phaseIndex]!.label}</p>
          </div>
        )}

        {status === 'connected' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-2xl font-semibold text-success">You've Got Mail!</p>
            <p className="font-mono text-sm text-fg-muted">
              {DIAL_UP_PHASES[DIAL_UP_PHASES.length - 1]!.label}
            </p>
            <Button variant="secondary" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

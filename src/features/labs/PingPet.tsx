import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import { PingPetCreature, type PetStatus } from './PingPetCreature'
import {
  classifyLatency,
  measureLatency,
  PING_TARGETS,
  type PingTarget,
} from '../../lib/labs/pingPet'

const POLL_INTERVAL_MS = 4000

const STATUS_COPY: Record<PetStatus, string> = {
  idle: 'Pick a target and press start.',
  checking: 'Pinging...',
  fast: "Zippy! That's a fast round trip.",
  medium: 'Doing fine, nothing to worry about.',
  slow: 'Feeling sluggish out there.',
  error: "Couldn't reach it.",
}

const STATUS_TONE: Record<PetStatus, 'neutral' | 'accent' | 'success' | 'warning' | 'danger'> = {
  idle: 'neutral',
  checking: 'accent',
  fast: 'success',
  medium: 'accent',
  slow: 'warning',
  error: 'danger',
}

export function PingPet() {
  const [target, setTarget] = useState<PingTarget>(PING_TARGETS[0]!)
  const [customHost, setCustomHost] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<PetStatus>('idle')
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const activeRef = useRef(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  const effectiveHost = customHost.trim() || target.host

  useEffect(() => {
    return () => {
      activeRef.current = false
      window.clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) {
        window.clearTimeout(timeoutRef.current)
      } else if (activeRef.current) {
        void runPing()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runPing() {
    if (!activeRef.current) return
    setStatus('checking')
    const ms = await measureLatency(effectiveHost)
    if (!activeRef.current) return
    setLatencyMs(ms)
    setStatus(classifyLatency(ms))
    timeoutRef.current = window.setTimeout(() => void runPing(), POLL_INTERVAL_MS)
  }

  function handleStart() {
    if (!effectiveHost) return
    activeRef.current = true
    setIsRunning(true)
    void runPing()
  }

  function handleStop() {
    activeRef.current = false
    window.clearTimeout(timeoutRef.current)
    setIsRunning(false)
    setStatus('idle')
    setLatencyMs(null)
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Ping pet</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          A small creature whose mood tracks the round-trip time to a host you pick. Not a real
          diagnostic tool -- just an approximate, fun reading via a lightweight browser request.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-10 text-center">
        <PingPetCreature status={status} />

        <div>
          <Badge tone={STATUS_TONE[status]}>{STATUS_COPY[status]}</Badge>
          <p className="mt-3 font-mono text-2xl">
            {latencyMs === null ? '--' : `${Math.round(latencyMs)} ms`}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">to {effectiveHost}</p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            {PING_TARGETS.map((option) => (
              <Pill
                key={option.host}
                disabled={isRunning}
                active={target.host === option.host && !customHost.trim()}
                onClick={() => {
                  setTarget(option)
                  setCustomHost('')
                }}
              >
                {option.label}
              </Pill>
            ))}
          </div>

          <Input
            placeholder="Or type a custom host (example.com)"
            value={customHost}
            onChange={(event) => setCustomHost(event.target.value)}
            disabled={isRunning}
            spellCheck={false}
          />

          {isRunning ? (
            <Button variant="secondary" onClick={handleStop}>
              Stop
            </Button>
          ) : (
            <Button variant="primary" onClick={handleStart}>
              Start pinging
            </Button>
          )}
        </div>

        <p className="max-w-md text-xs text-fg-subtle">
          Checks every few seconds while this page is open and visible -- not a continuous
          monitoring service.
        </p>
      </Card>
    </div>
  )
}

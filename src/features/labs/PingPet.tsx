import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import {
  classifyLatency,
  measureLatency,
  PING_TARGETS,
  type LatencyBand,
  type PingTarget,
} from '../../lib/labs/pingPet'

type PetStatus = 'idle' | 'checking' | LatencyBand

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

const BODY_FILL: Record<PetStatus, string> = {
  idle: 'fill-fg-subtle',
  checking: 'fill-accent',
  fast: 'fill-success',
  medium: 'fill-accent',
  slow: 'fill-warning',
  error: 'fill-danger',
}

const BODY_MOTION: Record<PetStatus, string> = {
  idle: 'motion-safe:animate-[pn-pet-idle_3s_ease-in-out_infinite]',
  checking: 'motion-safe:animate-pulse',
  fast: 'motion-safe:animate-bounce',
  medium: 'motion-safe:animate-[pn-pet-idle_3s_ease-in-out_infinite]',
  slow: 'motion-safe:animate-[pn-pet-idle_5s_ease-in-out_infinite]',
  error: '',
}

function PingPetCreature({ status }: { status: PetStatus }) {
  const isError = status === 'error'
  const isSlow = status === 'slow'

  return (
    <svg
      viewBox="0 0 120 120"
      className={`h-32 w-32 ${BODY_MOTION[status]}`}
      role="img"
      aria-label={`Ping pet, currently ${status}`}
    >
      <line
        x1="60"
        y1="38"
        x2="60"
        y2={isSlow ? 26 : 20}
        stroke="currentColor"
        className="text-fg-subtle"
        strokeWidth="2"
      />
      <circle cx="60" cy={isSlow ? 24 : 18} r="4" className={BODY_FILL[status]} />

      <ellipse
        cx="60"
        cy={isSlow ? 74 : 70}
        rx="38"
        ry={isSlow ? 28 : 32}
        className={BODY_FILL[status]}
        opacity="0.9"
      />

      {isError ? (
        <>
          <path
            d="M40 60L52 72M52 60L40 72"
            stroke="var(--color-bg)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M68 60L80 72M80 60L68 72"
            stroke="var(--color-bg)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="46" cy={isSlow ? 68 : 64} r="5" fill="var(--color-bg)" />
          <circle cx="74" cy={isSlow ? 68 : 64} r="5" fill="var(--color-bg)" />
        </>
      )}

      {isError ? (
        <path
          d="M50 86Q60 80 70 86"
          stroke="var(--color-bg)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          d={isSlow ? 'M50 86Q60 88 70 86' : 'M48 84Q60 96 72 84'}
          stroke="var(--color-bg)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
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
              <button
                key={option.host}
                type="button"
                disabled={isRunning}
                onClick={() => {
                  setTarget(option)
                  setCustomHost('')
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                  target.host === option.host && !customHost.trim()
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-fg-muted hover:text-fg'
                }`}
              >
                {option.label}
              </button>
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

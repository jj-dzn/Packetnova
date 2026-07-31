import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { measureLatency, PING_TARGETS, type PingTarget } from '../../lib/labs/pingPet'
import { generateHops, type GhostHop } from '../../lib/labs/tracerouteGhost'

type Status = 'idle' | 'measuring' | 'traveling' | 'done' | 'error'

const HOP_REVEAL_BASE_MS = 220

function bobClassFor(tiredness: number): string {
  if (tiredness > 0.66) return 'motion-safe:animate-[pn-pet-idle_5s_ease-in-out_infinite]'
  if (tiredness > 0.33) return 'motion-safe:animate-[pn-pet-idle_3.5s_ease-in-out_infinite]'
  return 'motion-safe:animate-[pn-pet-idle_2.5s_ease-in-out_infinite]'
}

function GhostCreature({ tiredness }: { tiredness: number }) {
  const droop = tiredness * 8
  return (
    <svg
      viewBox="0 0 100 110"
      className={`h-28 w-28 ${bobClassFor(tiredness)}`}
      style={{ opacity: 1 - tiredness * 0.3 }}
      role="img"
      aria-label={`Traceroute ghost, ${Math.round(tiredness * 100)}% tired`}
    >
      <path
        d="M20 50 Q20 10 50 10 Q80 10 80 50 L80 95 L70 85 L60 95 L50 85 L40 95 L30 85 L20 95 Z"
        className="fill-fg-subtle"
      />
      <circle cx="38" cy={38 + droop * 0.3} r="4" fill="var(--color-bg)" />
      <circle cx="62" cy={38 + droop * 0.3} r="4" fill="var(--color-bg)" />
    </svg>
  )
}

export function TracerouteGhost() {
  const [target, setTarget] = useState<PingTarget>(PING_TARGETS[0]!)
  const [customHost, setCustomHost] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [hops, setHops] = useState<GhostHop[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [totalMs, setTotalMs] = useState<number | null>(null)
  const timeoutsRef = useRef<number[]>([])

  const effectiveHost = customHost.trim() || target.host
  const busy = status === 'measuring' || status === 'traveling'

  useEffect(() => {
    return () => timeoutsRef.current.forEach((id) => window.clearTimeout(id))
  }, [])

  async function trace() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
    setStatus('measuring')
    setHops([])
    setRevealedCount(0)
    setTotalMs(null)

    const ms = await measureLatency(effectiveHost)
    if (ms === null) {
      setStatus('error')
      return
    }

    setTotalMs(ms)
    const generatedHops = generateHops(ms, effectiveHost)
    setHops(generatedHops)
    setStatus('traveling')

    let elapsed = 0
    generatedHops.forEach((hop, index) => {
      elapsed += HOP_REVEAL_BASE_MS + Math.min(hop.latencyMs, 600)
      const id = window.setTimeout(() => {
        setRevealedCount(index + 1)
        if (index === generatedHops.length - 1) setStatus('done')
      }, elapsed)
      timeoutsRef.current.push(id)
    })
  }

  const tiredness = hops.length > 0 ? revealedCount / hops.length : 0

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Traceroute ghost</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          A ghost travels hop by hop toward its destination, getting more tired the higher the
          latency climbs. The overall trip time is real; the hops in between are simulated -- a real
          client-side traceroute isn't possible from a browser.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-10 text-center">
        <GhostCreature tiredness={tiredness} />

        {status === 'error' && (
          <p className="text-sm text-danger">Couldn't reach {effectiveHost}.</p>
        )}
        {status === 'measuring' && <p className="text-sm text-fg-muted">Measuring...</p>}
        {(status === 'traveling' || status === 'done') && totalMs !== null && (
          <p className="text-sm text-fg-muted">
            {status === 'done' ? 'Arrived' : 'Traveling'} -- {Math.round(totalMs)}ms total to{' '}
            {effectiveHost}
          </p>
        )}

        {hops.length > 0 && (
          <div className="w-full max-w-md text-left font-mono text-xs text-fg-muted">
            {hops.slice(0, revealedCount).map((hop) => (
              <p key={hop.index}>
                {hop.index} {hop.label} {hop.latencyMs}ms
              </p>
            ))}
          </div>
        )}

        <div className="flex w-full max-w-md flex-col gap-3">
          <div className="flex flex-wrap justify-center gap-2">
            {PING_TARGETS.map((option) => (
              <button
                key={option.host}
                type="button"
                disabled={busy}
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
            disabled={busy}
            spellCheck={false}
          />

          <Button onClick={trace} disabled={busy}>
            {busy ? 'Traveling...' : 'Send the ghost'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateLatency } from '../../../lib/calculations/latency'

const MIN_TRAVEL_ANIM_MS = 400
const MAX_TRAVEL_ANIM_MS = 2500
// Real one-way latencies are imperceptibly small (single-digit to low
// hundreds of ms) -- this maps that range onto an animation duration a
// human can actually watch, while still keeping "farther = visibly
// slower" true within the mapped range.
const ANIM_SCALE_CEILING_MS = 200

function travelAnimationDuration(oneWayMs: number): number {
  const clamped = Math.min(Math.max(oneWayMs, 0), ANIM_SCALE_CEILING_MS)
  return (
    MIN_TRAVEL_ANIM_MS +
    (clamped / ANIM_SCALE_CEILING_MS) * (MAX_TRAVEL_ANIM_MS - MIN_TRAVEL_ANIM_MS)
  )
}

export function LatencyCalculator() {
  const [distance, setDistance] = useState('1000')
  const [speed, setSpeed] = useState('200')

  const calc = calculateLatency(Number(distance), Number(speed))

  return (
    <ToolPageLayout
      category="VPN"
      title="Latency calculator"
      description="Estimate one-way and round-trip propagation delay across a given distance and medium."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="latency-distance" className="text-sm font-medium">
              Distance (km)
            </label>
            <Input
              id="latency-distance"
              className="mt-2"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="latency-speed" className="text-sm font-medium">
              Propagation speed (km/ms)
            </label>
            <Input
              id="latency-speed"
              className="mt-2"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
            />
            <p className="mt-1 text-xs text-fg-subtle">
              Default 200 km/ms (~2/3 c), typical for fiber or copper.
            </p>
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="One-way" value={`${calc.result.oneWayMs.toFixed(2)} ms`} />
              <ResultRow label="Round trip" value={`${calc.result.roundTripMs.toFixed(2)} ms`} />
            </dl>
            <div>
              <div className="mb-1 flex justify-between font-mono text-[10px] text-fg-subtle">
                <span>Source</span>
                <span>Destination</span>
              </div>
              <div className="relative h-6 rounded-full border border-border bg-bg">
                <div
                  key={`${distance}-${speed}`}
                  style={{
                    animationName: 'pn-packet-slide-right',
                    animationDuration: `${travelAnimationDuration(calc.result.oneWayMs)}ms`,
                    animationTimingFunction: 'ease-in-out',
                    animationFillMode: 'forwards',
                    left: '4%',
                  }}
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
                />
              </div>
              <p className="mt-1 text-xs text-fg-subtle">
                Animation is scaled for visibility, not to real time -- a longer bar of travel here
                always means a genuinely longer one-way delay.
              </p>
            </div>
            <p className="text-xs text-fg-subtle">
              Propagation delay only -- real-world latency also includes processing, queuing, and
              serialization delay at every hop.
            </p>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

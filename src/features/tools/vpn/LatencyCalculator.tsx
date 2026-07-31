import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateLatency } from '../../../lib/calculations/latency'

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

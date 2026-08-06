import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateLatency, type LatencyResult } from '../../../lib/calculations/latency'
import { latencyPresets } from '../../../content/reference/latencyPresets'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'

function buildLatencySteps(result: LatencyResult): GuidedStep[] {
  return [
    {
      title: '1. Divide distance by propagation speed',
      description: `${result.distanceKm.toLocaleString()} km, traveling at ${result.propagationSpeedKmPerMs} km/ms -- that's how far the signal covers in one millisecond.`,
      content: (
        <ResultRow
          label={`${result.distanceKm.toLocaleString()} km / ${result.propagationSpeedKmPerMs} km/ms`}
          value={`${result.oneWayMs.toFixed(2)} ms one-way`}
        />
      ),
    },
    {
      title: '2. Double it for the round trip',
      description:
        'A request has to travel there and the response has to travel back -- the same distance, twice.',
      content: (
        <ResultRow
          label={`${result.oneWayMs.toFixed(2)} ms × 2`}
          value={`${result.roundTripMs.toFixed(2)} ms round trip`}
        />
      ),
    },
  ]
}

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
  const [presetId, setPresetId] = useState('custom')
  const prefersReducedMotion = usePrefersReducedMotion()

  const calc = calculateLatency(Number(distance), Number(speed))

  return (
    <ToolPageLayout
      category="VPN"
      title="Latency calculator"
      description="Estimate one-way and round-trip propagation delay across a given distance and medium."
      status={calc.ok ? 'ok' : 'error'}
      related={[{ to: '/labs/ping-pet', label: 'Labs: watch a pet react to live latency' }]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="latency-preset" className="text-sm font-medium">
              Real-world distance preset
            </label>
            <Select
              id="latency-preset"
              className="mt-2"
              value={presetId}
              onChange={(e) => {
                const id = e.target.value
                setPresetId(id)
                const preset = latencyPresets.find((p) => p.id === id)
                if (preset) setDistance(String(preset.distanceKm))
              }}
            >
              <option value="custom">Custom distance</option>
              {latencyPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} (~{preset.distanceKm.toLocaleString()} km)
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-fg-subtle">
              Approximate great-circle distances, not fiber-route distances -- real cable paths
              follow terrain and existing infrastructure, so actual latency usually runs a bit
              higher than the straight-line number below.
            </p>
          </div>
          <div>
            <label htmlFor="latency-distance" className="text-sm font-medium">
              Distance (km)
            </label>
            <Input
              id="latency-distance"
              className="mt-2"
              value={distance}
              onChange={(e) => {
                setDistance(e.target.value)
                setPresetId('custom')
              }}
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
          <GuidedMode steps={buildLatencySteps(calc.result)}>
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
                    style={
                      prefersReducedMotion
                        ? { left: '96%' }
                        : {
                            animationName: 'pn-packet-slide-right',
                            animationDuration: `${travelAnimationDuration(calc.result.oneWayMs)}ms`,
                            animationTimingFunction: 'ease-in-out',
                            animationFillMode: 'forwards',
                            left: '4%',
                          }
                    }
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
                  />
                </div>
                <p className="mt-1 text-xs text-fg-subtle">
                  Animation is scaled for visibility, not to real time -- a longer bar of travel
                  here always means a genuinely longer one-way delay.
                </p>
              </div>
              <p className="text-xs text-fg-subtle">
                Propagation delay only -- real-world latency also includes processing, queuing, and
                serialization delay at every hop.
              </p>
            </div>
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Light in fiber travels at roughly 2/3 the speed of light in a vacuum (about 200 km/ms),
            so one-way propagation delay is just distance divided by that speed. This is a physical
            floor, not a typical measurement -- actual round-trip time also includes processing,
            queuing, and serialization delay at every router and switch along the path, so a real
            traceroute will always read higher than this number.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to sanity-check whether a latency you're seeing is even physically plausible
            for a given distance -- if a measured round-trip time is close to this theoretical
            minimum, the path is about as direct as it can be; if it's dramatically higher,
            something else (routing detours, congestion, an overloaded middlebox) is adding the
            difference. The cloud-region presets anchor this to the actual pairs an engineer sizing
            a multi-region deployment would be comparing.
          </p>
        }
        commonMistakes={
          <p>
            Assuming a straight-line distance matches the actual fiber route -- submarine cables and
            terrestrial fiber follow existing infrastructure and geography, not great circles, so
            real distance (and therefore real latency) usually runs noticeably higher than the
            straight-line number a map would suggest.
          </p>
        }
        troubleshootingTips={
          <p>
            If a real measured latency is far above this calculator's estimate for the same
            distance, propagation delay probably isn't the bottleneck -- look at queuing (a
            congested link), processing (an overloaded device in the path), or an inefficient route
            (traffic taking a longer path than the direct one) instead.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

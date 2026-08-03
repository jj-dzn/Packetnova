import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateTransferTime } from '../../../lib/calculations/transferTime'
import { transferSizePresets } from '../../../content/reference/transferSizePresets'
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion'

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)} s`
  const totalMinutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  if (totalMinutes < 60) return `${totalMinutes}m ${seconds}s`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

const MIN_PROGRESS_ANIM_MS = 400
const MAX_PROGRESS_ANIM_MS = 2500
// Real transfer times span milliseconds to hours -- this maps that range
// onto an animation duration a human can actually watch, while still
// keeping "longer bar fill" mean "genuinely slower transfer" within the
// mapped range. Anything at or beyond the ceiling just animates at the
// slowest rate rather than trying to represent the real duration 1:1.
const ANIM_SCALE_CEILING_S = 30

function progressAnimationDuration(seconds: number): number {
  const clamped = Math.min(Math.max(seconds, 0), ANIM_SCALE_CEILING_S)
  return (
    MIN_PROGRESS_ANIM_MS +
    (clamped / ANIM_SCALE_CEILING_S) * (MAX_PROGRESS_ANIM_MS - MIN_PROGRESS_ANIM_MS)
  )
}

export function TransferTimeCalculator() {
  const [sizeMB, setSizeMB] = useState('100')
  const [bandwidth, setBandwidth] = useState('100')
  const [presetId, setPresetId] = useState('custom')
  const prefersReducedMotion = usePrefersReducedMotion()

  const calc = calculateTransferTime(Number(sizeMB), Number(bandwidth))

  return (
    <ToolPageLayout
      category="VPN"
      title="Transfer time calculator"
      description="Estimate how long a file transfer will take at a given bandwidth."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="transfer-preset" className="text-sm font-medium">
              Real-world file size preset
            </label>
            <Select
              id="transfer-preset"
              className="mt-2"
              value={presetId}
              onChange={(e) => {
                const id = e.target.value
                setPresetId(id)
                const preset = transferSizePresets.find((p) => p.id === id)
                if (preset) setSizeMB(String(preset.sizeMB))
              }}
            >
              <option value="custom">Custom size</option>
              {transferSizePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="transfer-size" className="text-sm font-medium">
              File size (MB)
            </label>
            <Input
              id="transfer-size"
              className="mt-2"
              value={sizeMB}
              onChange={(e) => {
                setSizeMB(e.target.value)
                setPresetId('custom')
              }}
            />
          </div>
          <div>
            <label htmlFor="transfer-bandwidth" className="text-sm font-medium">
              Bandwidth (Mbps)
            </label>
            <Input
              id="transfer-bandwidth"
              className="mt-2"
              value={bandwidth}
              onChange={(e) => setBandwidth(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Transfer time" value={formatDuration(calc.result.seconds)} />
              <ResultRow label="Seconds (exact)" value={calc.result.seconds.toFixed(2)} />
            </dl>
            <div>
              <div className="mb-1 flex justify-between font-mono text-[10px] text-fg-subtle">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full border border-border bg-bg">
                <div
                  key={`${sizeMB}-${bandwidth}`}
                  style={
                    prefersReducedMotion
                      ? { width: '100%' }
                      : {
                          animationName: 'pn-progress-fill',
                          animationDuration: `${progressAnimationDuration(calc.result.seconds)}ms`,
                          animationTimingFunction: 'linear',
                          animationFillMode: 'forwards',
                        }
                  }
                  className="h-full rounded-full bg-accent"
                />
              </div>
              <p className="mt-1 text-xs text-fg-subtle">
                Animation is scaled for visibility, not to real time -- a longer fill here always
                means a genuinely longer transfer.
              </p>
            </div>
            <p className="text-xs text-fg-subtle">
              This is the theoretical best case at the full bandwidth you entered. Real transfers
              rarely sustain 100% of nominal bandwidth -- TCP overhead, a connection that hasn't
              fully ramped up yet, and other traffic sharing the same link all eat into it, so a
              real transfer typically takes noticeably longer than this number.
            </p>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Transfer time is just file size divided by bandwidth, converted to the same units (bits,
            not bytes -- bandwidth is measured in bits per second, so the file size in megabytes
            gets multiplied by 8 first). This is the theoretical minimum at the stated bandwidth,
            assuming the full link is available for the entire transfer.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to sanity-check whether a transfer time you're seeing is reasonable for a given
            file and link speed -- planning how long a backup job or large download will
            realistically take, or working out what bandwidth you'd actually need to hit a deadline.
          </p>
        }
        commonMistakes={
          <p>
            Confusing megabytes (MB, file size) with megabits (Mb, the unit bandwidth is quoted in)
            is the single most common mistake here -- there are 8 bits per byte, so a "100 Mbps"
            connection transfers at most 12.5 MB per second, not 100. Treating a link's advertised
            bandwidth as a guarantee is another: real-world throughput is almost always lower than
            the number on the plan.
          </p>
        }
        troubleshootingTips={
          <p>
            If a real transfer is taking noticeably longer than this calculator predicts, that gap
            is normal, not necessarily a problem -- TCP slow start, other traffic sharing the link,
            and protocol overhead all reduce sustained throughput below the theoretical link speed.
            Consistently getting well under half the expected time is worth investigating further
            (packet loss, a misconfigured MTU, or a bottleneck elsewhere in the path).
          </p>
        }
      />
    </ToolPageLayout>
  )
}

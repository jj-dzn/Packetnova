import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateTransferTime } from '../../../lib/calculations/transferTime'

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)} s`
  const totalMinutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  if (totalMinutes < 60) return `${totalMinutes}m ${seconds}s`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m ${seconds}s`
}

export function TransferTimeCalculator() {
  const [sizeMB, setSizeMB] = useState('100')
  const [bandwidth, setBandwidth] = useState('100')

  const calc = calculateTransferTime(Number(sizeMB), Number(bandwidth))

  return (
    <ToolPageLayout
      category="VPN"
      title="Transfer time calculator"
      description="Estimate how long a file transfer will take at a given bandwidth."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="transfer-size" className="text-sm font-medium">
              File size (MB)
            </label>
            <Input
              id="transfer-size"
              className="mt-2"
              value={sizeMB}
              onChange={(e) => setSizeMB(e.target.value)}
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
          <dl>
            <ResultRow label="Transfer time" value={formatDuration(calc.result.seconds)} />
            <ResultRow label="Seconds (exact)" value={calc.result.seconds.toFixed(2)} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

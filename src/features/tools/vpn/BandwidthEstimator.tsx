import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateEffectiveBandwidth } from '../../../lib/calculations/bandwidth'

export function BandwidthEstimator() {
  const [rawBandwidth, setRawBandwidth] = useState('100')
  const [overhead, setOverhead] = useState('40')
  const [packetSize, setPacketSize] = useState('1500')

  const calc = calculateEffectiveBandwidth(
    Number(rawBandwidth),
    Number(overhead),
    Number(packetSize),
  )

  return (
    <ToolPageLayout
      category="VPN"
      title="Bandwidth estimator"
      description="Estimate real-world throughput after protocol and tunnel overhead."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="bw-raw" className="text-sm font-medium">
              Raw bandwidth (Mbps)
            </label>
            <Input
              id="bw-raw"
              className="mt-2"
              value={rawBandwidth}
              onChange={(e) => setRawBandwidth(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bw-overhead" className="text-sm font-medium">
              Overhead per packet (bytes)
            </label>
            <Input
              id="bw-overhead"
              className="mt-2"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="bw-packet-size" className="text-sm font-medium">
              Typical packet size (bytes)
            </label>
            <Input
              id="bw-packet-size"
              className="mt-2"
              value={packetSize}
              onChange={(e) => setPacketSize(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow
                label="Overhead"
                value={`${(calc.result.overheadFraction * 100).toFixed(2)}%`}
              />
              <ResultRow
                label="Effective bandwidth"
                value={`${calc.result.effectiveBandwidthMbps.toFixed(2)} Mbps`}
              />
            </dl>
            <p className="text-xs text-fg-subtle">
              Overhead is a fixed number of bytes per packet, so it eats a bigger share of small
              packets than large ones. Here, {calc.result.overheadBytes} bytes of overhead on a{' '}
              {calc.result.packetSizeBytes}-byte packet is{' '}
              {(calc.result.overheadFraction * 100).toFixed(2)}%
              {calc.result.overheadBytes < 64 && (
                <>
                  {' '}
                  -- the same {calc.result.overheadBytes} bytes on a 64-byte packet would be{' '}
                  {((calc.result.overheadBytes / 64) * 100).toFixed(2)}%
                </>
              )}
              . Bundling more data into fewer, larger packets is one of the simplest ways to recover
              throughput lost to tunnel or protocol overhead.
            </p>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

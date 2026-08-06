import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateEffectiveBandwidth } from '../../../lib/calculations/bandwidth'
import { EffectiveBandwidthChart } from './EffectiveBandwidthChart'

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
      status={calc.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/vpn-tunnel-overhead-calculator', label: 'VPN tunnel overhead calculator' },
        { to: '/tools/mtu-calculator', label: 'MTU calculator' },
      ]}
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
            <div>
              <p className="mb-1 text-xs font-medium text-fg-muted">
                Effective bandwidth across packet sizes
              </p>
              <EffectiveBandwidthChart
                rawBandwidthMbps={Number(rawBandwidth)}
                overheadBytes={Number(overhead)}
                currentPacketSize={Number(packetSize)}
              />
            </div>
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
    >
      <ToolEducation
        howItWorks={
          <p>
            Overhead is a fixed number of bytes tacked onto every packet regardless of that packet's
            size, so its cost as a percentage depends entirely on how big the packets carrying it
            are -- the same overhead eats a much bigger share of a small packet than a large one.
            Effective bandwidth is just raw bandwidth scaled down by that percentage.
          </p>
        }
        whenToUseThis={
          <p>
            Estimating what a link or tunnel will actually deliver before committing to it based on
            its advertised raw bandwidth, especially for traffic made of small packets -- VoIP's
            tiny RTP packets are the classic worst case, where overhead that would barely register
            on a bulk file transfer's large packets can consume a large share of the link.
          </p>
        }
        commonMistakes={
          <p>
            Treating bandwidth and throughput as the same number -- bandwidth is the link's raw
            capacity, throughput is what's actually delivered after every layer of overhead between
            here and there takes its cut. Sizing a link purely on advertised bandwidth without
            checking what packet sizes will actually cross it is how a link that looks like more
            than enough on paper turns out undersized in practice.
          </p>
        }
        relatedReading={
          <p>
            Work out a specific tunnel type's overhead in bytes first with the{' '}
            <Link
              to="/tools/vpn-tunnel-overhead-calculator"
              className="text-accent hover:underline"
            >
              VPN tunnel overhead calculator
            </Link>
            , then bring that number here.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

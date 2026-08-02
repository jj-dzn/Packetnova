import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { calculateMtu, type MtuResult } from '../../../lib/calculations/mtu'
import { calculateMss } from '../../../lib/calculations/mss'
import { calculateFragmentation } from '../../../lib/calculations/fragmentation'
import { DoesItFitBar } from './DoesItFitBar'

// The three tools T10 already cross-linked (MTU -> MSS -> Packet
// Fragmentation) as one guided narrative instead of three separate visits --
// each step reuses the same calc functions those standalone tools call,
// fed from this tool's own live inputs, so the numbers stay consistent
// across all three instead of being a disconnected fixed example.
function buildMtuChainSteps(mtu: MtuResult, payload: number): GuidedStep[] {
  const mssCalc = calculateMss(mtu.effectiveMtu, 4, 0, 0)
  const fragCalc = calculateFragmentation(payload, mtu.effectiveMtu)

  return [
    {
      title: '1. Does it fit?',
      description: `A ${payload.toLocaleString()}-byte payload against a ${mtu.effectiveMtu.toLocaleString()}-byte effective MTU (${mtu.linkMtu.toLocaleString()}-byte link MTU minus ${mtu.overheadBytes.toLocaleString()} bytes of overhead).`,
      content: (
        <ResultRow
          label="Fits?"
          value={mtu.fits ? 'Yes' : `No -- ${mtu.excessBytes.toLocaleString()} bytes over`}
        />
      ),
    },
    {
      title: '2. What would have prevented this',
      description:
        'For TCP traffic, the sender and receiver negotiate a Maximum Segment Size during the handshake -- sized to fit inside the path MTU from the start, so it never has to find out the hard way.',
      content: mssCalc.ok ? (
        <ResultRow label="MSS at this effective MTU" value={`${mssCalc.result.mss} bytes`} />
      ) : (
        <p className="text-sm text-fg-subtle">{mssCalc.error}</p>
      ),
    },
    {
      title: '3. What happens if nothing clamped it',
      description:
        "If a packet this size gets sent anyway -- UDP traffic, or MSS clamping that isn't configured -- fragmentation is what actually happens at the router, not a dropped packet.",
      content: fragCalc.ok ? (
        fragCalc.result.needsFragmentation ? (
          <div className="flex flex-col gap-2">
            <ResultRow label="Fragments" value={String(fragCalc.result.fragments.length)} />
            <div className="flex h-8 gap-1">
              {fragCalc.result.fragments.map((fragment) => (
                <div
                  key={fragment.index}
                  title={`Fragment ${fragment.index}: ${fragment.totalBytes} bytes`}
                  style={{ flexGrow: fragment.totalBytes, flexBasis: 0 }}
                  className="flex min-w-0 items-center justify-center overflow-hidden rounded-sm border border-accent/40 bg-accent/10 px-1 text-center font-mono text-[10px] text-accent"
                >
                  <span className="truncate">#{fragment.index}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-fg-subtle">
            This payload already fits at {mtu.effectiveMtu.toLocaleString()} bytes -- try a larger
            payload above to see fragmentation actually happen.
          </p>
        )
      ) : (
        <p className="text-sm text-fg-subtle">{fragCalc.error}</p>
      ),
    },
  ]
}

export function MtuCalculator() {
  const [linkMtu, setLinkMtu] = useState('1500')
  const [overhead, setOverhead] = useState('0')
  const [payload, setPayload] = useState('1500')

  const calc = calculateMtu(Number(linkMtu), Number(overhead), Number(payload))

  return (
    <ToolPageLayout
      category="VPN"
      title="MTU calculator"
      description="Find the right MTU for a link and see what happens when a given payload doesn't fit."
      related={[
        { to: '/tools/mss-calculator', label: 'MSS calculator' },
        { to: '/tools/packet-fragmentation-calculator', label: 'Packet fragmentation calculator' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="mtu-link" className="text-sm font-medium">
              Link MTU (bytes)
            </label>
            <Input
              id="mtu-link"
              className="mt-2"
              value={linkMtu}
              onChange={(e) => setLinkMtu(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mtu-overhead" className="text-sm font-medium">
              Overhead (bytes)
            </label>
            <Input
              id="mtu-overhead"
              className="mt-2"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mtu-payload" className="text-sm font-medium">
              Payload size to test (bytes)
            </label>
            <Input
              id="mtu-payload"
              className="mt-2"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <input
              type="range"
              aria-label="Payload size to test, drag to explore"
              min={0}
              max={9000}
              step={1}
              value={Math.min(9000, Math.max(0, Number(payload) || 0))}
              onChange={(e) => setPayload(e.target.value)}
              className="mt-3 w-full accent-accent"
            />
            <div className="relative mt-1 h-3 text-[10px] text-fg-subtle">
              <span className="absolute left-0">0</span>
              {/* 1500/9000 -- positioned to its actual place on the scale,
                  not the visual midpoint, so it stays an honest reference
                  point rather than just decoration. */}
              <span className="absolute -translate-x-1/2" style={{ left: '16.7%' }}>
                1500
              </span>
              <span className="absolute right-0">9000 (jumbo)</span>
            </div>
            {calc.ok && (
              <div className="mt-4">
                <DoesItFitBar
                  effectiveMtu={calc.result.effectiveMtu}
                  payload={Number(payload) || 0}
                />
              </div>
            )}
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <GuidedMode
            steps={buildMtuChainSteps(calc.result, Number(payload))}
            closingNote={
              <>
                This is why real networks lean on setting MSS correctly (or working Path MTU
                Discovery) instead of relying on fragmentation as a safety net -- fragmentation
                works, but it costs latency and per-fragment overhead every single time it kicks in.
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="Effective MTU" value={`${calc.result.effectiveMtu} bytes`} />
                <ResultRow label="Fits?" value={calc.result.fits ? 'Yes' : 'No -- will fragment'} />
                <ResultRow label="Excess" value={`${calc.result.excessBytes} bytes`} />
              </dl>
              {!calc.result.fits && (
                <p className="text-xs text-fg-subtle">
                  A payload this size gets fragmented into multiple packets to cross this link,
                  which adds latency and per-packet overhead. For TCP traffic this is usually
                  avoided instead of fixed after the fact -- see the{' '}
                  <Link to="/tools/mss-calculator" className="text-accent hover:underline">
                    MSS calculator
                  </Link>{' '}
                  to work out the segment size that fits in one packet from the start.
                </p>
              )}
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
            Effective MTU is the link's advertised MTU minus whatever overhead sits between your
            traffic and the wire -- tunnel headers, VLAN tags, anything else wrapping the packet.
            Fits/doesn't-fit compares your payload against that effective number, not the raw link
            MTU, since the raw number overstates what's actually available once encapsulation is
            accounted for.
          </p>
        }
        whenToUseThis={
          <p>
            Use this whenever a link's real usable payload size is in question -- sizing a tunnel
            interface's MTU correctly, or working out why traffic across a specific path behaves
            differently from traffic on a plain 1500-byte Ethernet segment.
          </p>
        }
        commonMistakes={
          <p>
            Leaving a tunnel interface at the default 1500-byte MTU without accounting for the
            tunnel's own encapsulation overhead is the single most common version of this mistake --
            the interface claims a size it can't actually deliver once its own headers are added.
          </p>
        }
        troubleshootingTips={
          <p>
            The classic real-world symptom: a GRE or IPsec tunnel interface left at the default
            1500-byte MTU even though the tunnel's own overhead means it can't actually carry 1500
            bytes of payload. Traffic seems fine at first -- small packets and the TCP handshake go
            through -- until something sends a full-size packet, gets silently dropped, and there's
            no obvious error, just a connection that "hangs." That's usually a Path MTU Discovery
            black hole: a firewall along the path is dropping the ICMP "fragmentation needed"
            message that's supposed to tell the sender to shrink its packets.
          </p>
        }
        relatedReading={
          <p>
            See the segment-size side of this directly in the{' '}
            <Link to="/tools/mss-calculator" className="text-accent hover:underline">
              MSS calculator
            </Link>
            , or watch fragmentation actually happen in the{' '}
            <Link
              to="/tools/packet-fragmentation-calculator"
              className="text-accent hover:underline"
            >
              Packet fragmentation calculator
            </Link>
            .
          </p>
        }
      />
    </ToolPageLayout>
  )
}

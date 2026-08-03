import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateFragmentation } from '../../../lib/calculations/fragmentation'

export function PacketFragmentationCalculator() {
  const [packetSize, setPacketSize] = useState('4000')
  const [pathMtu, setPathMtu] = useState('1500')

  const calc = calculateFragmentation(Number(packetSize), Number(pathMtu))

  return (
    <ToolPageLayout
      category="VPN"
      title="Packet fragmentation calculator"
      description="See when and how an IPv4 packet gets fragmented for a given path MTU."
      related={[
        { to: '/tools/mtu-calculator', label: 'MTU calculator' },
        { to: '/tools/mss-calculator', label: 'MSS calculator' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="frag-packet-size" className="text-sm font-medium">
              Packet size (bytes, including IP header)
            </label>
            <Input
              id="frag-packet-size"
              className="mt-2"
              value={packetSize}
              onChange={(e) => setPacketSize(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="frag-path-mtu" className="text-sm font-medium">
              Path MTU (bytes)
            </label>
            <Input
              id="frag-path-mtu"
              className="mt-2"
              value={pathMtu}
              onChange={(e) => setPathMtu(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow
                label="Needs fragmentation?"
                value={calc.result.needsFragmentation ? 'Yes' : 'No'}
              />
              <ResultRow label="Fragments" value={String(calc.result.fragments.length)} />
            </dl>
            <div className="flex h-10 gap-1">
              {calc.result.fragments.map((fragment) => (
                <div
                  key={fragment.index}
                  title={`Fragment ${fragment.index}: ${fragment.totalBytes} bytes`}
                  style={{
                    flexGrow: fragment.totalBytes,
                    flexBasis: 0,
                    animationDelay: `${(fragment.index - 1) * 90}ms`,
                  }}
                  className="motion-safe:animate-pn-fragment-peel flex min-w-0 items-center justify-center overflow-hidden rounded-sm border border-accent/40 bg-accent/10 px-1 text-center font-mono text-[11px] text-accent"
                >
                  <span className="truncate">#{fragment.index}</span>
                </div>
              ))}
            </div>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-fg-muted">#</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Payload</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Total size</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Offset</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">MF flag</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.result.fragments.map((fragment) => (
                    <tr
                      key={fragment.index}
                      className="border-b border-border font-mono last:border-b-0"
                    >
                      <td className="px-3 py-2">{fragment.index}</td>
                      <td className="px-3 py-2">{fragment.payloadBytes} B</td>
                      <td className="px-3 py-2">{fragment.totalBytes} B</td>
                      <td className="px-3 py-2">
                        {fragment.offsetUnits} ({fragment.offsetBytes} B)
                      </td>
                      <td className="px-3 py-2">{fragment.moreFragments ? '1' : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            A packet larger than the path MTU gets split into multiple fragments, each with its own
            IP header (which is why fragmentation has real overhead -- every fragment after the
            first repeats 20 bytes of header for data that was already going to arrive together).
            Offsets are measured in 8-byte units, so every fragment's payload except the last must
            be a multiple of 8 bytes -- that alignment requirement is why fragment sizes aren't
            simply "MTU minus header" evenly divided.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to see exactly how a specific oversized packet would split for a given path MTU
            -- how many fragments, how much overhead each one adds, and where the offsets land.
          </p>
        }
        commonMistakes={
          <p>
            Assuming this applies equally to IPv6 is the most common mistake -- it doesn't. This
            calculator is IPv4-specific for a reason: in IPv6, routers never fragment packets in
            transit at all, only the originating host is allowed to. A router that receives an IPv6
            packet too big for the next link just drops it and sends back an ICMPv6 "Packet Too Big"
            message instead.
          </p>
        }
        troubleshootingTips={
          <p>
            A network that quietly relied on in-transit fragmentation as a safety net under IPv4
            will see real packet loss the moment it's dual-stacked or moved to IPv6-only, which is
            why getting Path MTU Discovery working end-to-end matters even more there than it did
            under IPv4.
          </p>
        }
        relatedReading={
          <p>
            See why a packet ended up this size in the first place in the{' '}
            <Link to="/tools/mtu-calculator" className="text-accent hover:underline">
              MTU calculator
            </Link>
            , or how TCP avoids fragmentation entirely via the{' '}
            <Link to="/tools/mss-calculator" className="text-accent hover:underline">
              MSS calculator
            </Link>
            .
          </p>
        }
      />
    </ToolPageLayout>
  )
}

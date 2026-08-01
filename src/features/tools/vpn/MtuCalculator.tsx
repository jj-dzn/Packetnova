import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { Input } from '../../../components/ui/Input'
import { calculateMtu } from '../../../lib/calculations/mtu'

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
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Effective MTU" value={`${calc.result.effectiveMtu} bytes`} />
              <ResultRow label="Fits?" value={calc.result.fits ? 'Yes' : 'No -- will fragment'} />
              <ResultRow label="Excess" value={`${calc.result.excessBytes} bytes`} />
            </dl>
            {!calc.result.fits && (
              <p className="text-xs text-fg-subtle">
                A payload this size gets fragmented into multiple packets to cross this link, which
                adds latency and per-packet overhead. For TCP traffic this is usually avoided
                instead of fixed after the fact -- see the MSS calculator to work out the segment
                size that fits in one packet from the start.
              </p>
            )}
            <Aside>
              The classic real-world version of this: a GRE or IPsec tunnel interface left at the
              default 1500-byte MTU even though the tunnel's own overhead means it can't actually
              carry 1500 bytes of payload. Traffic seems fine at first -- small packets and the TCP
              handshake go through -- until something sends a full-size packet, gets silently
              dropped, and there's no obvious error, just a connection that "hangs." That's usually
              a Path MTU Discovery black hole: a firewall along the path is dropping the ICMP
              "fragmentation needed" message that's supposed to tell the sender to shrink its
              packets.
            </Aside>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

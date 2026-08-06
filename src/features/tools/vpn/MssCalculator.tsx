import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateMss, type MssResult } from '../../../lib/calculations/mss'

// A subtraction chain, one header at a time -- MSS isn't one formula so
// much as "start with the MTU and keep taking bites out of it," and seeing
// each bite named (which header, how many bytes) is what makes the final
// number make sense instead of just appearing.
function buildMssSteps(result: MssResult): GuidedStep[] {
  const afterIp = result.mtu - result.ipHeaderBytes

  return [
    {
      title: '1. Start with the MTU',
      description: `The full frame budget available on this link -- every byte a single packet is allowed to be.`,
      content: <ResultRow label="MTU" value={`${result.mtu} bytes`} />,
    },
    {
      title: '2. Subtract the IP header',
      description: `${result.ipHeaderBytes} bytes of IP header (including any IP options) have to wrap the segment -- that space is never available for TCP payload.`,
      content: (
        <ResultRow
          label={`${result.mtu} - ${result.ipHeaderBytes}`}
          value={`${afterIp} bytes remaining`}
        />
      ),
    },
    {
      title: "3. Subtract the TCP header -- what's left is MSS",
      description: `The TCP header (including any TCP options) takes another ${result.tcpHeaderBytes} bytes. Whatever's left over is the largest chunk of actual data one segment can carry.`,
      content: (
        <ResultRow
          label={`${afterIp} - ${result.tcpHeaderBytes}`}
          value={`${result.mss} bytes = MSS`}
        />
      ),
    },
  ]
}

export function MssCalculator() {
  const [mtu, setMtu] = useState('1500')
  const [ipVersion, setIpVersion] = useState<'4' | '6'>('4')
  const [ipOptions, setIpOptions] = useState('0')
  const [tcpOptions, setTcpOptions] = useState('0')

  const calc = calculateMss(
    Number(mtu),
    ipVersion === '4' ? 4 : 6,
    Number(ipOptions),
    Number(tcpOptions),
  )

  return (
    <ToolPageLayout
      category="VPN"
      title="MSS calculator"
      description="Work out the maximum TCP segment size for a given MTU and header overhead."
      status={calc.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/mtu-calculator', label: 'MTU calculator' },
        { to: '/tools/packet-fragmentation-calculator', label: 'Packet fragmentation calculator' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="mss-mtu" className="text-sm font-medium">
              MTU (bytes)
            </label>
            <Input
              id="mss-mtu"
              className="mt-2"
              value={mtu}
              onChange={(e) => setMtu(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mss-ip-version" className="text-sm font-medium">
              IP version
            </label>
            <Select
              id="mss-ip-version"
              className="mt-2"
              value={ipVersion}
              onChange={(e) => setIpVersion(e.target.value as '4' | '6')}
            >
              <option value="4">IPv4 (20-byte header)</option>
              <option value="6">IPv6 (40-byte header)</option>
            </Select>
          </div>
          <div>
            <label htmlFor="mss-ip-options" className="text-sm font-medium">
              IP options (bytes)
            </label>
            <Input
              id="mss-ip-options"
              className="mt-2"
              value={ipOptions}
              onChange={(e) => setIpOptions(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mss-tcp-options" className="text-sm font-medium">
              TCP options (bytes)
            </label>
            <Input
              id="mss-tcp-options"
              className="mt-2"
              value={tcpOptions}
              onChange={(e) => setTcpOptions(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <GuidedMode steps={buildMssSteps(calc.result)}>
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="IP header" value={`${calc.result.ipHeaderBytes} bytes`} />
                <ResultRow label="TCP header" value={`${calc.result.tcpHeaderBytes} bytes`} />
                <ResultRow label="MSS" value={`${calc.result.mss} bytes`} />
              </dl>
              <p className="text-xs text-fg-subtle">
                This is what fits given a {calc.result.mtu}-byte MTU. If a router somewhere along
                the path has a smaller MTU, it can clamp the MSS announced during the TCP handshake
                below {calc.result.mss} bytes so segments never need{' '}
                <Link
                  to="/tools/packet-fragmentation-calculator"
                  className="text-accent hover:underline"
                >
                  IP fragmentation
                </Link>{' '}
                -- this is MSS clamping, and it's why the value your OS reports isn't always the
                value a server actually negotiates.
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
            MSS is what's left of the MTU after subtracting every header that has to wrap the TCP
            payload -- the IP header (20 bytes for IPv4, 40 for IPv6, plus any options) and the TCP
            header itself (20 bytes, plus any options). It's the largest chunk of actual data TCP
            will put in one segment so the resulting packet fits the link without needing
            fragmentation.
          </p>
        }
        whenToUseThis={
          <p>
            Use this when sizing a tunnel or link where the effective MTU is smaller than a normal
            1500-byte Ethernet link -- VPN tunnels, PPPoE connections, anything adding encapsulation
            overhead -- to work out what MSS needs to be clamped to so TCP segments actually fit end
            to end.
          </p>
        }
        commonMistakes={
          <p>
            Assuming the MSS your OS reports for a connection is the value actually used --
            middleboxes along the path can clamp it lower during the handshake, and the negotiated
            value (the lower of what each side offers) is what's actually in effect, not necessarily
            what either side started with.
          </p>
        }
        troubleshootingTips={
          <p>
            The real-world scenario this explains: a site-to-site VPN where small requests work fine
            but anything that returns a lot of data (a file download, a large web page) just hangs.
            The TCP handshake succeeds because SYN packets are tiny, so it looks like the tunnel is
            up and working -- the problem only shows up once a segment near the full MSS tries to
            cross it and gets silently dropped. Configuring MSS clamping directly on the tunnel
            endpoint (rather than hoping Path MTU Discovery's ICMP messages make it through every
            firewall in between) is the fix network engineers reach for specifically because it
            doesn't depend on that ICMP path working at all.
          </p>
        }
        relatedReading={
          <p>
            MSS is derived from the link MTU --{' '}
            <Link to="/tools/mtu-calculator" className="text-accent hover:underline">
              MTU calculator
            </Link>{' '}
            walks through that relationship directly, including what happens when a payload doesn't
            fit.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

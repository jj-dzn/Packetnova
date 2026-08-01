import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateMss } from '../../../lib/calculations/mss'

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
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="IP header" value={`${calc.result.ipHeaderBytes} bytes`} />
              <ResultRow label="TCP header" value={`${calc.result.tcpHeaderBytes} bytes`} />
              <ResultRow label="MSS" value={`${calc.result.mss} bytes`} />
            </dl>
            <p className="text-xs text-fg-subtle">
              This is what fits given a {calc.result.mtu}-byte MTU. If a router somewhere along the
              path has a smaller MTU, it can clamp the MSS announced during the TCP handshake below{' '}
              {calc.result.mss} bytes so segments never need{' '}
              <Link
                to="/tools/packet-fragmentation-calculator"
                className="text-accent hover:underline"
              >
                IP fragmentation
              </Link>{' '}
              -- this is MSS clamping, and it's why the value your OS reports isn't always the value
              a server actually negotiates.
            </p>
            <Aside>
              The real-world scenario this explains: a site-to-site VPN where small requests work
              fine but anything that returns a lot of data (a file download, a large web page) just
              hangs. The TCP handshake succeeds because SYN packets are tiny, so it looks like the
              tunnel is up and working -- the problem only shows up once a segment near the full MSS
              tries to cross it and gets silently dropped. Configuring MSS clamping directly on the
              tunnel endpoint (rather than hoping Path MTU Discovery's ICMP messages make it through
              every firewall in between) is the fix network engineers reach for specifically because
              it doesn't depend on that ICMP path working at all.
            </Aside>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

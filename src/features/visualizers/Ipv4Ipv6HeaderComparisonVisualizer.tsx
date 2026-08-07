import { Link } from 'react-router'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { HeaderByteDiagram } from '../tools/HeaderByteDiagram'
import { ipHeaderFields } from '../../content/reference/ipHeaderFields'
import { ipv6HeaderFields } from '../../content/reference/ipv6HeaderFields'

interface DiffRow {
  change: 'removed' | 'renamed' | 'added' | 'kept'
  ipv4: string
  ipv6: string
  note: string
}

const DIFF_ROWS: DiffRow[] = [
  {
    change: 'kept',
    ipv4: 'Version',
    ipv6: 'Version',
    note: 'Same field, same position -- 4 vs 6.',
  },
  {
    change: 'renamed',
    ipv4: 'Type of Service (DSCP+ECN)',
    ipv6: 'Traffic Class',
    note: 'Same QoS marking purpose, renamed.',
  },
  {
    change: 'renamed',
    ipv4: 'Time to Live',
    ipv6: 'Hop Limit',
    note: 'Identical behavior (decremented per hop), renamed to describe what it actually does.',
  },
  {
    change: 'renamed',
    ipv4: 'Protocol',
    ipv6: 'Next Header',
    note: 'Same field, repurposed to also chain optional extension headers.',
  },
  {
    change: 'added',
    ipv4: '--',
    ipv6: 'Flow Label',
    note: 'New: lets routers treat all packets in a flow consistently without inspecting upper-layer headers.',
  },
  {
    change: 'removed',
    ipv4: 'IHL',
    ipv6: '--',
    note: 'Gone: the IPv6 fixed header is always exactly 40 bytes, so there is nothing to measure.',
  },
  {
    change: 'removed',
    ipv4: 'Identification, Flags, Fragment Offset',
    ipv6: '--',
    note: 'Gone from the fixed header: fragmentation moved to an optional extension header, and routers along the path no longer fragment at all -- only the sending host can.',
  },
  {
    change: 'removed',
    ipv4: 'Header Checksum',
    ipv6: '--',
    note: 'Gone: link layers and upper layers already checksum, and recomputing a header checksum at every hop (since TTL/Hop Limit changes every hop) was pure overhead.',
  },
  {
    change: 'kept',
    ipv4: 'Source / Destination Address (32 bits each)',
    ipv6: 'Source / Destination Address (128 bits each)',
    note: 'Same role, 4x the length -- the entire reason IPv6 exists.',
  },
]

const DIFF_TONE: Record<DiffRow['change'], string> = {
  removed: 'text-danger',
  renamed: 'text-warning',
  added: 'text-success',
  kept: 'text-fg-subtle',
}

const DIFF_LABEL: Record<DiffRow['change'], string> = {
  removed: 'Removed',
  renamed: 'Renamed',
  added: 'Added',
  kept: 'Kept',
}

export function Ipv4Ipv6HeaderComparisonVisualizer() {
  return (
    <VisualizerPageLayout
      category="Comparison"
      title="IPv4 vs IPv6 header"
      description="The same packet header, redesigned -- what got removed, renamed, and added between IPv4 and IPv6."
      related={[
        { to: '/tools/ip-header-explorer', label: 'IP header explorer' },
        { to: '/tools/ipv6-calculator', label: 'IPv6 calculator' },
      ]}
    >
      <p className="mb-6 text-sm text-fg-muted">
        IPv6's header isn't IPv4's header with longer addresses bolted on -- it's a genuine
        simplification. Five IPv4 fields (IHL, Identification, Flags, Fragment Offset, Header
        Checksum) are gone entirely, three more are renamed, one new field was added, and the result
        is a <em>fixed</em> 40-byte header that every router can process faster than IPv4's
        variable-length one, despite carrying addresses four times as long.
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">IPv4 header -- 20 bytes (minimum)</h3>
          <HeaderByteDiagram fields={ipHeaderFields} exportLabel="ipv4-header-byte-diagram" />
        </div>
        <div>
          <h3 className="mb-2 font-semibold">IPv6 header -- 40 bytes (always)</h3>
          <HeaderByteDiagram fields={ipv6HeaderFields} exportLabel="ipv6-header-byte-diagram" />
        </div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface">
            <tr className="border-b border-border">
              <th className="px-3 py-2 font-medium text-fg-muted">Change</th>
              <th className="px-3 py-2 font-medium text-fg-muted">IPv4 field</th>
              <th className="px-3 py-2 font-medium text-fg-muted">IPv6 field</th>
              <th className="px-3 py-2 font-medium text-fg-muted">Why</th>
            </tr>
          </thead>
          <tbody>
            {DIFF_ROWS.map((row, index) => (
              <tr key={index} className="border-b border-border last:border-b-0">
                <td className={`px-3 py-2 font-mono text-xs font-medium ${DIFF_TONE[row.change]}`}>
                  {DIFF_LABEL[row.change]}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{row.ipv4}</td>
                <td className="px-3 py-2 font-mono text-xs">{row.ipv6}</td>
                <td className="px-3 py-2 text-xs text-fg-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-xs text-fg-subtle">
        Want to build either header field by field, or decode a real one?{' '}
        <Link to="/tools/ip-header-explorer" className="text-accent hover:underline">
          IP header explorer
        </Link>{' '}
        covers IPv4 in full detail.
      </p>
    </VisualizerPageLayout>
  )
}

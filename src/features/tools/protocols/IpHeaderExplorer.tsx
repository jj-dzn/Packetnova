import { useState } from 'react'
import { Link } from 'react-router'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ResultRow } from '../ResultRow'
import { RfcFootnote } from '../RfcFootnote'
import { ToolEducation } from '../ToolEducation'
import { HeaderByteDiagram } from '../HeaderByteDiagram'
import { DataTable } from '../../../components/ui/DataTable'
import { calculateIpFlags, type IpFlags } from '../../../lib/calculations/ipFlags'
import { ipHeaderFields } from '../../../content/reference/ipHeaderFields'
import type { HeaderField } from '../../../content/reference/tcpHeaderFields'

export function IpHeaderExplorer() {
  const [flags, setFlags] = useState<IpFlags>({ dontFragment: true, moreFragments: false })

  const calc = calculateIpFlags(flags)

  return (
    <ReferencePageLayout
      category="Protocols"
      title="IP header explorer"
      description="Every field in an IPv4 header, byte by byte, plus a quick flags-field calculator."
      related={[{ to: '/tools/icmp-explorer', label: 'ICMP explorer' }]}
    >
      <div className="mb-8">
        <HeaderByteDiagram
          fields={ipHeaderFields}
          values={{ Flags: calc.binary }}
          caption="Flags: live from checkboxes below"
        />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface p-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-medium">Flags</span>
          <div className="mt-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flags.dontFragment}
                onChange={(e) =>
                  setFlags((current) => ({ ...current, dontFragment: e.target.checked }))
                }
              />
              Don't Fragment (DF)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flags.moreFragments}
                onChange={(e) =>
                  setFlags((current) => ({ ...current, moreFragments: e.target.checked }))
                }
              />
              More Fragments (MF)
            </label>
          </div>
        </div>
        <dl>
          <ResultRow label="Flags (binary)" value={calc.binary} />
          <ResultRow label="Decimal" value={String(calc.value)} />
        </dl>
      </div>
      <DataTable<HeaderField>
        columns={[
          { key: 'field', label: 'Field' },
          { key: 'offset', label: 'Byte offset', mono: true },
          { key: 'size', label: 'Size', mono: true },
          {
            key: 'description',
            label: 'Description',
            render: (row) =>
              row.field === 'Fragment Offset' ? (
                <>
                  {row.description} -- see it in action in the{' '}
                  <Link
                    to="/tools/packet-fragmentation-calculator"
                    className="text-accent hover:underline"
                  >
                    Packet fragmentation calculator
                  </Link>
                  .
                </>
              ) : (
                row.description
              ),
          },
        ]}
        rows={ipHeaderFields}
      />
      <RfcFootnote>Defined in RFC 791.</RfcFootnote>
      <ToolEducation
        howItWorks={
          <p>
            Every IPv4 packet carries this 20-byte header (more with options) ahead of its payload,
            recording where it's from, where it's going, how long it has left to live, and whether
            it's part of a fragmented set. The flags calculator above shows exactly how DF and MF
            combine into the 3-bit flags field alongside the 13-bit Fragment Offset.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to look up what a specific field means when reading a packet capture, or to
            check how the DF/MF flags combine into the byte you're seeing on the wire.
          </p>
        }
        commonMistakes={
          <p>
            Treating TTL as a countdown timer rather than what it actually is -- a hop-count safety
            net. It's decremented by one at every router, not once per second; a packet stuck in a
            routing loop dies after a fixed number of hops regardless of how much real time has
            passed, which is the entire reason the field exists.
          </p>
        }
        troubleshootingTips={
          <p>
            If a destination reports "TTL exceeded" or a traceroute stalls, that's this exact field
            hitting zero -- almost always a routing loop or a path with more real hops than
            expected, not a timing issue.
          </p>
        }
        relatedReading={
          <p>
            A TTL expiry is what triggers the ICMP Time Exceeded message covered in the{' '}
            <Link to="/tools/icmp-explorer" className="text-accent hover:underline">
              ICMP explorer
            </Link>
            .
          </p>
        }
      />
    </ReferencePageLayout>
  )
}

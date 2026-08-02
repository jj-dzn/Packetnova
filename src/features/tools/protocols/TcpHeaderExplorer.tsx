import { useState } from 'react'
import { Link } from 'react-router'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ResultRow } from '../ResultRow'
import { HeaderByteDiagram } from '../HeaderByteDiagram'
import { RfcFootnote } from '../RfcFootnote'
import { Aside } from '../Aside'
import { ToolEducation } from '../ToolEducation'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { DataTable } from '../../../components/ui/DataTable'
import {
  buildTcpHeader,
  calculateTcpFlags,
  type TcpFlags,
} from '../../../lib/calculations/tcpFlags'
import { tcpHeaderFields } from '../../../content/reference/tcpHeaderFields'
import type { HeaderField } from '../../../content/reference/tcpHeaderFields'

// A round trip long enough to be a realistic "high BDP" path (satellite,
// long-haul WAN) without needing the visitor to enter their own RTT --
// illustrative, not derived from any of the tool's other inputs.
const ILLUSTRATIVE_RTT_MS = 100

const FLAG_LABELS: { key: keyof TcpFlags; label: string }[] = [
  { key: 'urg', label: 'URG' },
  { key: 'ack', label: 'ACK' },
  { key: 'psh', label: 'PSH' },
  { key: 'rst', label: 'RST' },
  { key: 'syn', label: 'SYN' },
  { key: 'fin', label: 'FIN' },
]

export function TcpHeaderExplorer() {
  const [flags, setFlags] = useState<TcpFlags>({
    urg: false,
    ack: true,
    psh: false,
    rst: false,
    syn: true,
    fin: false,
  })
  const [showBuilder, setShowBuilder] = useState(false)
  const [sourcePort, setSourcePort] = useState('50000')
  const [destPort, setDestPort] = useState('443')
  const [seqNumber, setSeqNumber] = useState('1000000000')
  const [ackNumber, setAckNumber] = useState('0')
  const [windowSize, setWindowSize] = useState('65535')
  const [checksum, setChecksum] = useState('0')
  const [urgentPointer, setUrgentPointer] = useState('0')

  const calc = calculateTcpFlags(flags)
  const headerCalc = buildTcpHeader({
    sourcePort: Number(sourcePort),
    destPort: Number(destPort),
    seqNumber: Number(seqNumber),
    ackNumber: Number(ackNumber),
    flags,
    windowSize: Number(windowSize),
    checksum: Number(checksum),
    urgentPointer: Number(urgentPointer),
  })

  const liveValues: Record<string, string> | undefined = showBuilder
    ? {
        'Source Port': sourcePort,
        'Destination Port': destPort,
        'Sequence Number': seqNumber,
        'Acknowledgment Number': ackNumber,
        'Data Offset': '5',
        Flags: calc.hex,
        'Window Size': windowSize,
        Checksum: checksum,
        'Urgent Pointer': urgentPointer,
      }
    : undefined

  return (
    <ReferencePageLayout
      category="Protocols"
      title="TCP header explorer"
      description="Every field in a TCP header, byte by byte, plus a quick flags-byte calculator."
    >
      <div className="mb-8">
        <HeaderByteDiagram
          fields={tcpHeaderFields}
          values={liveValues}
          caption={showBuilder ? 'showing live builder values' : undefined}
        />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface p-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-medium">Flags</span>
          <div className="mt-2 flex flex-wrap gap-4">
            {FLAG_LABELS.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={flags[key]}
                  onChange={(e) => setFlags((current) => ({ ...current, [key]: e.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
        <dl>
          <ResultRow label="Flags byte" value={calc.hex} />
          <ResultRow label="Decimal" value={String(calc.value)} />
        </dl>
      </div>

      <div className="mb-8">
        <Pill active={showBuilder} onClick={() => setShowBuilder((v) => !v)}>
          {showBuilder ? 'Hide' : 'Show'} full header builder (expert)
        </Pill>
        {showBuilder && (
          <div className="mt-4 grid grid-cols-1 gap-6 rounded-lg border border-border bg-surface p-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="tcp-source-port" className="text-sm font-medium">
                  Source port
                </label>
                <Input
                  id="tcp-source-port"
                  className="mt-1"
                  value={sourcePort}
                  onChange={(e) => setSourcePort(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tcp-dest-port" className="text-sm font-medium">
                  Destination port
                </label>
                <Input
                  id="tcp-dest-port"
                  className="mt-1"
                  value={destPort}
                  onChange={(e) => setDestPort(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tcp-seq" className="text-sm font-medium">
                  Sequence number
                </label>
                <Input
                  id="tcp-seq"
                  className="mt-1"
                  value={seqNumber}
                  onChange={(e) => setSeqNumber(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tcp-ack" className="text-sm font-medium">
                  Acknowledgment number
                </label>
                <Input
                  id="tcp-ack"
                  className="mt-1"
                  value={ackNumber}
                  onChange={(e) => setAckNumber(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tcp-window" className="text-sm font-medium">
                  Window size
                </label>
                <Input
                  id="tcp-window"
                  className="mt-1"
                  value={windowSize}
                  onChange={(e) => setWindowSize(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tcp-checksum" className="text-sm font-medium">
                  Checksum
                </label>
                <Input
                  id="tcp-checksum"
                  className="mt-1"
                  value={checksum}
                  onChange={(e) => setChecksum(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="tcp-urgent" className="text-sm font-medium">
                  Urgent pointer
                </label>
                <Input
                  id="tcp-urgent"
                  className="mt-1"
                  value={urgentPointer}
                  onChange={(e) => setUrgentPointer(e.target.value)}
                />
              </div>
              <p className="text-xs text-fg-subtle">
                Flags come from the checkboxes above. Data Offset is fixed at 5 (20 bytes, no
                options) -- this builds a minimal header, not one with TCP options attached.
              </p>
            </div>
            {headerCalc.ok ? (
              <div>
                <p className="text-sm font-medium">Full header (20 bytes)</p>
                <p className="mt-2 break-all rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {headerCalc.result.hex}
                </p>
                <dl className="mt-3">
                  <ResultRow
                    label="Source/dest ports"
                    value={headerCalc.result.bytes
                      .slice(0, 4)
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join('')}
                  />
                  <ResultRow
                    label="Sequence number"
                    value={headerCalc.result.bytes
                      .slice(4, 8)
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join('')}
                  />
                  <ResultRow
                    label="Ack number"
                    value={headerCalc.result.bytes
                      .slice(8, 12)
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join('')}
                  />
                  <ResultRow
                    label="Offset + flags"
                    value={headerCalc.result.bytes
                      .slice(12, 14)
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join('')}
                  />
                  <ResultRow
                    label="Window/checksum/urgent"
                    value={headerCalc.result.bytes
                      .slice(14, 20)
                      .map((b) => b.toString(16).padStart(2, '0'))
                      .join('')}
                  />
                </dl>
              </div>
            ) : (
              <p className="text-sm text-danger">{headerCalc.error}</p>
            )}
            {Number(windowSize) > 0 && (
              <div className="lg:col-span-2">
                <Aside>
                  Window size caps how much unacknowledged data can be in flight at once, so it's
                  also a hard ceiling on throughput once a path's latency gets long enough: max
                  throughput works out to window size divided by round-trip time, regardless of how
                  fast the link itself is. At a {windowSize}-byte window over a{' '}
                  {ILLUSTRATIVE_RTT_MS}ms round trip -- not unusual for a satellite or long-haul WAN
                  path -- that caps out around{' '}
                  {((Number(windowSize) * 8) / (ILLUSTRATIVE_RTT_MS / 1000) / 1_000_000).toFixed(2)}{' '}
                  Mbps, no matter how much bandwidth is actually available. TCP window scaling (RFC
                  7323) is what lifts the classic 16-bit, 65,535-byte ceiling this field implies --
                  without it, that number above is the hard limit on any single connection over this
                  path.
                </Aside>
              </div>
            )}
          </div>
        )}
      </div>

      <DataTable<HeaderField>
        columns={[
          { key: 'field', label: 'Field' },
          { key: 'offset', label: 'Byte offset', mono: true },
          { key: 'size', label: 'Size', mono: true },
          { key: 'description', label: 'Description' },
        ]}
        rows={tcpHeaderFields}
      />
      <RfcFootnote>
        Defined in RFC 793 -- RFC 9293 is the current consolidated specification, folding in decades
        of clarifications and errata without changing the wire format.
      </RfcFootnote>
      <ToolEducation
        howItWorks={
          <p>
            Every TCP segment carries this 20-byte header (more if options are present) ahead of its
            payload, identifying the connection (ports), tracking data in flight (sequence and
            acknowledgment numbers), and controlling behavior (flags, window size). The flags byte
            above is a live calculator; the full builder constructs an entire minimal header from
            the fields you enter.
          </p>
        }
        whenToUseThis={
          <p>
            Use the flags calculator to check what a specific flag combination looks like on the
            wire when reading a packet capture. Use the full builder to understand exactly how each
            field lays out byte-for-byte, or to hand-construct a header for testing.
          </p>
        }
        commonMistakes={
          <p>
            Misreading the Data Offset field is a classic gotcha: it's a count of 32-bit words, not
            bytes -- a value of 5 means 5 × 4 = 20 bytes, the minimum header size with no options.
            Reading it as a raw byte count would make every header look 4× smaller than it actually
            is. It's easy to overlook because most other length fields in TCP/IP headers (like IP's
            Total Length) really are byte counts.
          </p>
        }
        troubleshootingTips={
          <p>
            If a throughput ceiling doesn't match expected bandwidth on a long or high-latency path,
            check whether TCP window scaling is actually negotiated and in effect -- without it, the
            16-bit window field caps a single connection's throughput at window size divided by
            round-trip time, regardless of how much bandwidth the link actually has.
          </p>
        }
        relatedReading={
          <p>
            See this header's fields in motion during connection setup in the{' '}
            <Link to="/visualizers/tcp-handshake" className="text-accent hover:underline">
              TCP handshake visualizer
            </Link>
            .
          </p>
        }
      />
    </ReferencePageLayout>
  )
}

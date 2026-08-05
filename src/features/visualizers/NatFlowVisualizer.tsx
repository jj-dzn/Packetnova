import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { MiddleboxFlowContent, type MiddleboxStep } from './MiddleboxFlowVisualizer'
import { NatTableDiagram } from '../diagram/NatTableDiagram'
import { Pill } from '../../components/ui/Pill'

const PRIVATE_ADDR = '192.168.1.10:5000'
const PUBLIC_ADDR = '203.0.113.5:40001'
const SERVER_ADDR = '203.0.113.50:443'

const MAPPED_TABLE = (
  <NatTableDiagram
    rows={[{ id: 'mapping', privateAddr: PRIVATE_ADDR, publicAddr: PUBLIC_ADDR }]}
    dense
    showHeader={false}
  />
)

const STEPS: MiddleboxStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The private host wants to reach a server on the internet. The NAT table is empty.',
    middleValue: null,
    hop: null,
  },
  {
    title: '1. Host sends the packet',
    description: `The host sends a packet from its private address (${PRIVATE_ADDR}) toward the public server.`,
    middleValue: null,
    hop: { direction: 'right', segment: 'left-middle', label: `src=${PRIVATE_ADDR}` },
  },
  {
    title: '2. Router translates and forwards',
    description: `The NAT router records the mapping and rewrites the source address to a public one (${PUBLIC_ADDR}) before forwarding.`,
    middleValue: MAPPED_TABLE,
    hop: { direction: 'right', segment: 'middle-right', label: `src=${PUBLIC_ADDR}` },
  },
  {
    title: '3. Server replies',
    description: `The server has no idea a private host exists -- it just replies to the public address it saw (${PUBLIC_ADDR}).`,
    middleValue: MAPPED_TABLE,
    hop: { direction: 'left', segment: 'middle-right', label: `dst=${PUBLIC_ADDR}` },
  },
  {
    title: '4. Router translates back',
    description:
      'The router looks up the mapping, rewrites the destination back to the private address, and delivers it to the host.',
    middleValue: MAPPED_TABLE,
    hop: { direction: 'left', segment: 'left-middle', label: `dst=${PRIVATE_ADDR}` },
  },
]

type Mode = 'static' | 'pat'

export function NatFlowVisualizer() {
  const [mode, setMode] = useState<Mode>('static')

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="NAT flow simulator"
      description={
        mode === 'static'
          ? 'Watch how NAT translates a private address and port as a packet leaves the network.'
          : 'PAT (NAT overload) is what most home and office routers actually run: many private hosts share one public IP, disambiguated by port -- not the one-to-one mapping the static mode above shows.'
      }
      related={[{ to: '/journey/nat', label: 'Inside a NAT translation (deep dive)' }]}
    >
      <div className="mb-6 flex gap-2">
        <Pill active={mode === 'static'} onClick={() => setMode('static')}>
          Static NAT (1:1)
        </Pill>
        <Pill active={mode === 'pat'} onClick={() => setMode('pat')}>
          PAT / NAT overload (many:1)
        </Pill>
      </div>

      {mode === 'static' ? (
        <MiddleboxFlowContent
          leftLabel="Private host"
          leftValue={PRIVATE_ADDR}
          middleLabel="NAT router"
          middleIdleValue="No mappings yet"
          rightLabel="Public server"
          rightValue={SERVER_ADDR}
          steps={STEPS}
          crossesInternet
        />
      ) : (
        <PatOverloadTable />
      )}
    </VisualizerPageLayout>
  )
}

const PUBLIC_IP = '203.0.113.5'

interface PatEntry {
  id: number
  privateAddr: string
  publicPort: number
}

const SAMPLE_PRIVATE_HOSTS = [
  '192.168.1.10:51000',
  '192.168.1.11:51000',
  '192.168.1.12:52000',
  '192.168.1.13:51000',
  '192.168.1.14:53210',
  '192.168.1.10:51001',
]

const INITIAL_ENTRIES: PatEntry[] = [
  { id: 1, privateAddr: SAMPLE_PRIVATE_HOSTS[0]!, publicPort: 40001 },
  { id: 2, privateAddr: SAMPLE_PRIVATE_HOSTS[1]!, publicPort: 40002 },
  { id: 3, privateAddr: SAMPLE_PRIVATE_HOSTS[2]!, publicPort: 40003 },
]

// One public IP, many private hosts -- each connection gets its own public
// port instead of its own public address, which is the entire mechanism
// PAT/"NAT overload" relies on. Letting the user add connections and watch
// the table grow (all sharing PUBLIC_IP, never colliding on port) makes
// that concrete instead of asserted.
function PatOverloadTable() {
  const [entries, setEntries] = useState<PatEntry[]>(INITIAL_ENTRIES)
  const nextId = entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1
  const nextPort = entries.length > 0 ? Math.max(...entries.map((e) => e.publicPort)) + 1 : 40001

  function addConnection() {
    const privateAddr = SAMPLE_PRIVATE_HOSTS[entries.length % SAMPLE_PRIVATE_HOSTS.length]!
    setEntries((current) => [...current, { id: nextId, privateAddr, publicPort: nextPort }])
  }

  function reset() {
    setEntries(INITIAL_ENTRIES)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Every row below is a different private host (or a different connection from the same host),
        but they all share the single public address <strong>{PUBLIC_IP}</strong>. The router tells
        them apart purely by which public port each connection was assigned.
      </p>

      <NatTableDiagram
        rows={entries.map((entry) => ({
          id: entry.id,
          privateAddr: entry.privateAddr,
          publicAddr: `${PUBLIC_IP}:${entry.publicPort}`,
        }))}
        leftHeader="Private host:port"
        rightHeader={`Public ${PUBLIC_IP}:port`}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addConnection}
          className="rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
        >
          + Add connection
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-fg-muted hover:text-fg"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-fg-subtle">
        With 16 bits of port space (minus well-known ports), one public IP can multiplex roughly
        64,000 simultaneous connections this way -- which is exactly how an office of hundreds of
        people shares a handful of public IPv4 addresses.
      </p>
    </div>
  )
}

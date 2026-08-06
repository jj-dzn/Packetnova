import { Link } from 'react-router'
import { SectionHeader } from './SectionHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import {
  TopologyCanvas,
  type TopologyNode,
  type TopologyEdge,
} from '../../features/diagram/TopologyCanvas'
import { buildInterfaceConfig } from '../../lib/calculations/deviceConfig'

const PREVIEW_NODES: TopologyNode[] = [
  { id: 'r1', x: 100, y: 30, label: 'Router 1', icon: 'router' },
  { id: 's1', x: 55, y: 105, label: 'Switch 1', icon: 'switch' },
  { id: 's2', x: 145, y: 105, label: 'Switch 2', icon: 'switch' },
]
const PREVIEW_EDGES: TopologyEdge[] = [
  { from: 'r1', to: 's1' },
  { from: 'r1', to: 's2' },
]

// A real config from the real production builder, not typed-out fake
// text -- if buildInterfaceConfig's output ever changes, this preview
// changes with it automatically instead of silently going stale.
const CONFIG_PREVIEW = buildInterfaceConfig({
  vendor: 'ios',
  hostname: 'R1',
  interfaceName: 'GigabitEthernet0/1',
  ipAddress: '10.0.12.1',
  prefixLength: 24,
  description: 'Uplink to core',
})

// The three newest, biggest features get zero homepage presence
// otherwise -- a visitor who doesn't already know Topology Canvas,
// Device Config Generator, or branching Challenge Mode exist has no way
// to stumble into any of them from the homepage. Each preview here is
// something actually rendered or actually computed (the canvas is a
// live SVG render, the config is real calculator output), not a
// screenshot file that goes stale the next time the tool changes.
export function FlagshipShowcase() {
  return (
    <section className="py-14">
      <SectionHeader
        title="Built this cycle"
        subtitle="Three new ways to work, not just look things up"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <Badge tone="accent">Topology canvas</Badge>
          <TopologyCanvas
            nodes={PREVIEW_NODES}
            edges={PREVIEW_EDGES}
            viewWidth={200}
            viewHeight={140}
            className="mx-auto w-full max-w-[220px]"
          />
          <p className="flex-1 text-sm text-fg-muted">
            Build a network by hand -- place devices, draw links, then open any device straight into
            the right calculator, pre-filled.
          </p>
          <Link to="/tools/topology-canvas">
            <Button variant="secondary">Open the canvas</Button>
          </Link>
        </Card>

        <Card className="flex flex-col gap-3">
          <Badge tone="accent">Device config generator</Badge>
          <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-[11px] text-fg-muted">
            {CONFIG_PREVIEW.ok ? CONFIG_PREVIEW.result.config : ''}
          </pre>
          <p className="flex-1 text-sm text-fg-muted">
            Real, vendor-specific device config -- six vendors, generated from the same math the
            calculators already use.
          </p>
          <Link to="/tools/device-config-generator">
            <Button variant="secondary">Generate a config</Button>
          </Link>
        </Card>

        <Card className="flex flex-col gap-3">
          <Badge tone="accent">Branching challenge mode</Badge>
          <div className="rounded-md border border-border bg-bg p-3">
            <p className="text-xs text-fg-subtle">A wrong turn, mid-scenario</p>
            <p className="mt-1 text-sm text-fg">"...so you shorten the DHCP lease time?"</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-danger/40 bg-danger/10 px-2 py-1 text-xs text-danger">
                Dead end -- doesn't fix it
              </span>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent">
                Correct path
              </span>
            </div>
          </div>
          <p className="flex-1 text-sm text-fg-muted">
            Real wrong turns, a timer, and a shareable score card -- troubleshooting scenarios you
            can actually get wrong.
          </p>
          <Link to="/scenarios/dhcp-lease-failure">
            <Button variant="secondary">Try a challenge</Button>
          </Link>
        </Card>
      </div>
    </section>
  )
}

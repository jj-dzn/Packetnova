import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { Button } from '../../../components/ui/Button'
import { CopyButton } from '../../../components/ui/CopyButton'
import { useUrlState } from '../../../hooks/useUrlState'
import { downloadTextFile } from '../../../lib/download'
import {
  buildInterfaceConfig,
  buildStaticRouteConfig,
  CONFIG_VENDORS,
  CONFIG_VENDOR_LABELS,
  CONFIG_VENDOR_FILE_EXTENSION,
  DEFAULT_INTERFACE_NAME,
  type ConfigVendor,
} from '../../../lib/calculations/deviceConfig'
import { STORAGE_KEY, type CanvasNode, type CanvasLink } from './TopologyBuilder'

type Template = 'interface' | 'route'

function loadTopologyNodes(): { nodes: CanvasNode[]; links: CanvasLink[] } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
        return { nodes: parsed.nodes, links: parsed.links }
      }
    }
  } catch {
    // Corrupt or inaccessible storage -- just show no nodes to pick from.
  }
  return { nodes: [], links: [] }
}

export function DeviceConfigGenerator() {
  const [templateParam, setTemplate] = useUrlState('template', 'interface')
  const template: Template = templateParam === 'route' ? 'route' : 'interface'
  const [vendorParam, setVendor] = useUrlState('vendor', 'ios')
  const vendor: ConfigVendor = (CONFIG_VENDORS as string[]).includes(vendorParam)
    ? (vendorParam as ConfigVendor)
    : 'ios'
  const [hostname, setHostname] = useUrlState('hostname', 'R1')
  const [interfaceName, setInterfaceName] = useUrlState('iface', '')
  const [addr, setAddr] = useUrlState('addr', '10.0.12.1')
  const [prefix, setPrefix] = useUrlState('prefix', '24')
  const [vlan, setVlan] = useUrlState('vlan', '')
  const [mtu, setMtu] = useUrlState('mtu', '')
  const [desc, setDesc] = useUrlState('desc', '')
  const [destNet, setDestNet] = useUrlState('destNet', '172.16.0.0')
  const [destPrefix, setDestPrefix] = useUrlState('destPrefix', '16')
  const [nextHop, setNextHop] = useUrlState('nextHop', '10.0.12.254')

  const [showTopologyPicker, setShowTopologyPicker] = useState(false)
  const [topologyNodes, setTopologyNodes] = useState<CanvasNode[]>([])

  function openTopologyPicker() {
    const { nodes } = loadTopologyNodes()
    setTopologyNodes(nodes.filter((node) => node.address?.trim()))
    setShowTopologyPicker(true)
  }

  function applyTopologyNode(node: CanvasNode) {
    const { links } = loadTopologyNodes()
    const [host, addrPrefix] = (node.address ?? '').split('/')
    setHostname(node.label)
    if (host) setAddr(host)
    if (addrPrefix) setPrefix(addrPrefix)

    const connectedLink = links.find((link) => link.from === node.id || link.to === node.id)
    setMtu(connectedLink?.mtu?.trim() ?? '')
    setVlan(connectedLink?.vlanId?.trim() ?? '')
    setShowTopologyPicker(false)
  }

  const effectiveInterfaceName = interfaceName.trim() || DEFAULT_INTERFACE_NAME[vendor]

  const result =
    template === 'interface'
      ? buildInterfaceConfig({
          vendor,
          hostname,
          interfaceName: effectiveInterfaceName,
          ipAddress: addr,
          prefixLength: Number(prefix),
          vlanId: vlan.trim() ? Number(vlan) : undefined,
          mtu: mtu.trim() ? Number(mtu) : undefined,
          description: desc.trim() || undefined,
        })
      : buildStaticRouteConfig({
          vendor,
          hostname,
          destinationNetwork: destNet,
          destinationPrefixLength: Number(destPrefix),
          nextHop,
          description: desc.trim() || undefined,
        })

  const filename = `${(hostname.trim() || 'device').replace(/\s+/g, '-')}-config.${CONFIG_VENDOR_FILE_EXTENSION[vendor]}`

  return (
    <ToolPageLayout
      category="Utilities"
      title="Device config generator"
      description="Generate a real, vendor-specific interface or static-route config from the same math the rest of the site already does -- pick a vendor, fill in the fields, copy or download."
      status={result.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/topology-canvas', label: 'Topology canvas' },
        { to: '/tools/vlan-calculator', label: 'VLAN calculator' },
        { to: '/tools/subnet-calculator', label: 'Subnet calculator' },
        { to: '/labs/cursed-config', label: 'Labs: the joke version of this generator' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium">Template</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill active={template === 'interface'} onClick={() => setTemplate('interface')}>
                Interface configuration
              </Pill>
              <Pill active={template === 'route'} onClick={() => setTemplate('route')}>
                Static route
              </Pill>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Vendor</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONFIG_VENDORS.map((v) => (
                <Pill key={v} active={vendor === v} onClick={() => setVendor(v)}>
                  {CONFIG_VENDOR_LABELS[v]}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <Pill active={showTopologyPicker} onClick={openTopologyPicker}>
              Load from my topology
            </Pill>
            {showTopologyPicker && (
              <div className="mt-2 flex flex-col gap-2 rounded-md border border-border bg-surface p-3">
                {topologyNodes.length === 0 ? (
                  <p className="text-xs text-fg-subtle">
                    No devices with an address saved yet -- add one on the{' '}
                    <span className="text-fg">topology canvas</span> first.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-fg-subtle">
                      Pulls hostname and address from the device, and MTU/VLAN from a connected link
                      if either is set.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topologyNodes.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => applyTopologyNode(node)}
                          className="rounded-md border border-border bg-bg px-2.5 py-1.5 text-left text-xs hover:border-accent/40"
                        >
                          <span className="font-medium">{node.label}</span>
                          <span className="ml-1.5 font-mono text-fg-subtle">{node.address}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="dcg-hostname" className="text-sm font-medium">
              Hostname
            </label>
            <Input
              id="dcg-hostname"
              className="mt-2"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
            />
          </div>

          {template === 'interface' ? (
            <>
              <div>
                <label htmlFor="dcg-iface" className="text-sm font-medium">
                  Interface name
                </label>
                <Input
                  id="dcg-iface"
                  className="mt-2"
                  placeholder={DEFAULT_INTERFACE_NAME[vendor]}
                  value={interfaceName}
                  onChange={(e) => setInterfaceName(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="dcg-addr" className="text-sm font-medium">
                    IP address
                  </label>
                  <Input
                    id="dcg-addr"
                    className="mt-2"
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label htmlFor="dcg-prefix" className="text-sm font-medium">
                    Prefix
                  </label>
                  <Input
                    id="dcg-prefix"
                    className="mt-2"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="dcg-vlan" className="text-sm font-medium">
                    VLAN ID <span className="text-fg-subtle">(optional)</span>
                  </label>
                  <Input
                    id="dcg-vlan"
                    className="mt-2"
                    placeholder="none"
                    value={vlan}
                    onChange={(e) => setVlan(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="dcg-mtu" className="text-sm font-medium">
                    MTU <span className="text-fg-subtle">(optional)</span>
                  </label>
                  <Input
                    id="dcg-mtu"
                    className="mt-2"
                    placeholder="default"
                    value={mtu}
                    onChange={(e) => setMtu(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="dcg-destnet" className="text-sm font-medium">
                    Destination network
                  </label>
                  <Input
                    id="dcg-destnet"
                    className="mt-2"
                    value={destNet}
                    onChange={(e) => setDestNet(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label htmlFor="dcg-destprefix" className="text-sm font-medium">
                    Prefix
                  </label>
                  <Input
                    id="dcg-destprefix"
                    className="mt-2"
                    value={destPrefix}
                    onChange={(e) => setDestPrefix(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="dcg-nexthop" className="text-sm font-medium">
                  Next hop
                </label>
                <Input
                  id="dcg-nexthop"
                  className="mt-2"
                  value={nextHop}
                  onChange={(e) => setNextHop(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="dcg-desc" className="text-sm font-medium">
              Description <span className="text-fg-subtle">(optional)</span>
            </label>
            <Input
              id="dcg-desc"
              className="mt-2"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        result.ok ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{CONFIG_VENDOR_LABELS[vendor]}</p>
              <div className="flex gap-2">
                <CopyButton value={result.result.config} label="config" />
                <Button
                  variant="secondary"
                  onClick={() => downloadTextFile(filename, result.ok ? result.result.config : '')}
                >
                  Download {filename}
                </Button>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
              {result.result.config}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Each vendor gets its own builder using that platform's real config syntax -- dotted
            subnet masks for Cisco IOS, CIDR notation for NX-OS and EOS, Junos's declarative{' '}
            <code>set</code> lines, MikroTik's RouterOS script commands, and pfSense's GUI paths
            plus the equivalent underlying FreeBSD <code>ifconfig</code>/<code>route</code> commands
            (pfSense itself has no line CLI to generate for).
          </p>
        }
        whenToUseThis={
          <p>
            Bootstrapping a lab device, documenting an intended config before you type it in by
            hand, or translating a config you already have in your head from one vendor's syntax to
            another.
          </p>
        }
        commonMistakes={
          <p>
            A VLAN ID on the interface template creates a tagged subinterface (router-on-a-stick
            style) -- for a switchport in access mode, use the VLAN calculator's own vendor config
            output instead.
          </p>
        }
        relatedReading={
          <p>
            Build out a full network on the{' '}
            <Link to="/tools/topology-canvas" className="text-accent hover:underline">
              topology canvas
            </Link>{' '}
            first, then use "Load from my topology" here to generate configs for each device without
            retyping addresses.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

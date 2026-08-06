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
  buildAclConfig,
  buildVlanDatabaseConfig,
  CONFIG_VENDORS,
  CONFIG_VENDOR_LABELS,
  CONFIG_VENDOR_FILE_EXTENSION,
  DEFAULT_INTERFACE_NAME,
  type ConfigVendor,
  type ConfigResult,
  type VlanDatabaseEntry,
} from '../../../lib/calculations/deviceConfig'
import { STORAGE_KEY, type CanvasNode, type CanvasLink } from './TopologyBuilder'

type Mode = 'single' | 'batch'
type Template = 'interface' | 'route' | 'acl' | 'vlan-db'

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

// "10:Voice, 20:Data" -> [{id:10,name:'Voice'}, {id:20,name:'Data'}] -- a
// plain comma list instead of a dynamic add/remove row UI, matching how
// small this input actually needs to be for most VLAN databases.
function parseVlanList(text: string): VlanDatabaseEntry[] {
  return text
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [idPart, ...nameParts] = entry.split(':')
      return { id: Number((idPart ?? '').trim()), name: nameParts.join(':').trim() }
    })
}

// Same interface-config builder the single-device flow uses, run once per
// addressed topology node instead of once for whatever's in the form --
// "generate for my whole topology" was previously "repeat this flow by
// hand for every device," one node at a time.
function generateBatchConfig(vendor: ConfigVendor): ConfigResult {
  const { nodes, links } = loadTopologyNodes()
  const addressed = nodes.filter((node) => node.address?.trim())
  if (addressed.length === 0) {
    return { ok: false, error: 'Nothing to generate -- see above.' }
  }

  const blocks: string[] = []
  for (const node of addressed) {
    const [host, prefixStr] = (node.address ?? '').split('/')
    if (!host || !prefixStr) continue
    const connectedLink = links.find((link) => link.from === node.id || link.to === node.id)
    const result = buildInterfaceConfig({
      vendor,
      hostname: node.label,
      interfaceName: DEFAULT_INTERFACE_NAME[vendor],
      ipAddress: host,
      prefixLength: Number(prefixStr),
      vlanId: connectedLink?.vlanId?.trim() ? Number(connectedLink.vlanId) : undefined,
      mtu: connectedLink?.mtu?.trim() ? Number(connectedLink.mtu) : undefined,
    })
    if (result.ok) blocks.push(`# ---- ${node.label} ----\n${result.result.config}`)
  }

  if (blocks.length === 0) {
    return { ok: false, error: 'None of the saved devices had a usable address/prefix.' }
  }
  return { ok: true, result: { config: blocks.join('\n\n') } }
}

export function DeviceConfigGenerator() {
  const [modeParam, setMode] = useUrlState('mode', 'single')
  const mode: Mode = modeParam === 'batch' ? 'batch' : 'single'
  const [templateParam, setTemplate] = useUrlState('template', 'interface')
  const template: Template = (['interface', 'route', 'acl', 'vlan-db'] as string[]).includes(
    templateParam,
  )
    ? (templateParam as Template)
    : 'interface'
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
  const [aclName, setAclName] = useUrlState('aclName', 'BLOCK_GUEST')
  const [aclActionParam, setAclAction] = useUrlState('aclAction', 'deny')
  const aclAction: 'permit' | 'deny' = aclActionParam === 'permit' ? 'permit' : 'deny'
  const [aclSrc, setAclSrc] = useUrlState('aclSrc', '10.0.20.0')
  const [aclPrefix, setAclPrefix] = useUrlState('aclPrefix', '24')
  const [vlanList, setVlanList] = useUrlState('vlans', '10:Voice, 20:Data')

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

  const batchResult = mode === 'batch' ? generateBatchConfig(vendor) : null
  const batchNodeCount =
    mode === 'batch' ? loadTopologyNodes().nodes.filter((n) => n.address?.trim()).length : 0

  const singleResult =
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
      : template === 'route'
        ? buildStaticRouteConfig({
            vendor,
            hostname,
            destinationNetwork: destNet,
            destinationPrefixLength: Number(destPrefix),
            nextHop,
            description: desc.trim() || undefined,
          })
        : template === 'acl'
          ? buildAclConfig({
              vendor,
              hostname,
              aclName,
              action: aclAction,
              sourceNetwork: aclSrc,
              sourcePrefixLength: Number(aclPrefix),
            })
          : buildVlanDatabaseConfig({ vendor, hostname, vlans: parseVlanList(vlanList) })

  const config = mode === 'batch' ? batchResult : singleResult
  const filename =
    mode === 'batch'
      ? `topology-configs.${CONFIG_VENDOR_FILE_EXTENSION[vendor]}`
      : `${(hostname.trim() || 'device').replace(/\s+/g, '-')}-config.${CONFIG_VENDOR_FILE_EXTENSION[vendor]}`

  return (
    <ToolPageLayout
      category="Utilities"
      title="Device config generator"
      description="Generate a real, vendor-specific config from the same math the rest of the site already does -- pick a vendor, fill in the fields, copy or download. Or generate one for every device in your saved topology at once."
      status={config?.ok ? 'ok' : 'error'}
      related={[
        { to: '/tools/topology-canvas', label: 'Topology canvas' },
        { to: '/tools/vlan-calculator', label: 'VLAN calculator' },
        { to: '/tools/subnet-calculator', label: 'Subnet calculator' },
        { to: '/labs/cursed-config', label: 'Labs: the joke version of this generator' },
      ]}
      input={
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium">Scope</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Pill active={mode === 'single'} onClick={() => setMode('single')}>
                Single device
              </Pill>
              <Pill active={mode === 'batch'} onClick={() => setMode('batch')}>
                My whole topology
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

          {mode === 'batch' ? (
            <div className="rounded-md border border-border bg-surface p-3 text-sm text-fg-muted">
              {batchNodeCount === 0 ? (
                <p>
                  No devices with an address saved yet -- add one on the{' '}
                  <Link to="/tools/topology-canvas" className="text-accent hover:underline">
                    topology canvas
                  </Link>{' '}
                  first.
                </p>
              ) : (
                <p>
                  Generates an interface config for all <strong>{batchNodeCount}</strong> addressed
                  device{batchNodeCount === 1 ? '' : 's'} in your saved topology, pulling MTU/VLAN
                  from a connected link where set -- same as "Load from my topology" below, just for
                  every device at once.
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium">Template</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill active={template === 'interface'} onClick={() => setTemplate('interface')}>
                    Interface configuration
                  </Pill>
                  <Pill active={template === 'route'} onClick={() => setTemplate('route')}>
                    Static route
                  </Pill>
                  <Pill active={template === 'acl'} onClick={() => setTemplate('acl')}>
                    ACL
                  </Pill>
                  <Pill active={template === 'vlan-db'} onClick={() => setTemplate('vlan-db')}>
                    VLAN database
                  </Pill>
                </div>
              </div>

              {(template === 'interface' || template === 'route') && (
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
                            Pulls hostname and address from the device, and MTU/VLAN from a
                            connected link if either is set.
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
                                <span className="ml-1.5 font-mono text-fg-subtle">
                                  {node.address}
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

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

              {template === 'interface' && (
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
              )}

              {template === 'route' && (
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

              {template === 'acl' && (
                <>
                  <div>
                    <label htmlFor="dcg-aclname" className="text-sm font-medium">
                      ACL name
                    </label>
                    <Input
                      id="dcg-aclname"
                      className="mt-2"
                      value={aclName}
                      onChange={(e) => setAclName(e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Action</p>
                    <div className="mt-2 flex gap-2">
                      <Pill active={aclAction === 'permit'} onClick={() => setAclAction('permit')}>
                        Permit
                      </Pill>
                      <Pill active={aclAction === 'deny'} onClick={() => setAclAction('deny')}>
                        Deny
                      </Pill>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label htmlFor="dcg-aclsrc" className="text-sm font-medium">
                        Source network
                      </label>
                      <Input
                        id="dcg-aclsrc"
                        className="mt-2"
                        value={aclSrc}
                        onChange={(e) => setAclSrc(e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <label htmlFor="dcg-aclprefix" className="text-sm font-medium">
                        Prefix
                      </label>
                      <Input
                        id="dcg-aclprefix"
                        className="mt-2"
                        value={aclPrefix}
                        onChange={(e) => setAclPrefix(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-fg-subtle">
                    Matches this source against any destination -- the single-rule shape most ACL
                    entries actually take.
                  </p>
                </>
              )}

              {template === 'vlan-db' && (
                <div>
                  <label htmlFor="dcg-vlanlist" className="text-sm font-medium">
                    VLANs
                  </label>
                  <Input
                    id="dcg-vlanlist"
                    className="mt-2"
                    placeholder="10:Voice, 20:Data, 30:Guest"
                    value={vlanList}
                    onChange={(e) => setVlanList(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-fg-subtle">
                    Comma-separated <code>id:name</code> pairs.
                  </p>
                </div>
              )}

              {(template === 'interface' || template === 'route') && (
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
              )}
            </>
          )}
        </div>
      }
      result={
        config?.ok ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{CONFIG_VENDOR_LABELS[vendor]}</p>
              <div className="flex gap-2">
                <CopyButton value={config.result.config} label="config" />
                <Button
                  variant="secondary"
                  onClick={() => downloadTextFile(filename, config.result.config)}
                >
                  Download {filename}
                </Button>
              </div>
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
              {config.result.config}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-danger">{config?.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Each vendor gets its own builder using that platform's real config syntax -- dotted
            subnet masks for Cisco IOS, CIDR notation for NX-OS and EOS, Junos's declarative{' '}
            <code>set</code> lines, MikroTik's RouterOS script commands, and pfSense's GUI paths
            plus the equivalent underlying FreeBSD syntax (pfSense itself has no line CLI to
            generate for). "My whole topology" runs the interface builder once per addressed device
            instead of once for the form.
          </p>
        }
        whenToUseThis={
          <p>
            Bootstrapping a lab device, documenting an intended config before you type it in by
            hand, translating a config between vendor syntaxes, or standing up every device in a
            topology you've already built at once.
          </p>
        }
        commonMistakes={
          <p>
            A VLAN ID on the interface template creates a tagged subinterface (router-on-a-stick
            style) -- for a switchport in access mode, use the VLAN calculator's own vendor config
            output instead. The ACL template matches one source against any destination -- for a
            multi-rule ACL, generate each rule separately and concatenate them.
          </p>
        }
        relatedReading={
          <p>
            Build out a full network on the{' '}
            <Link to="/tools/topology-canvas" className="text-accent hover:underline">
              topology canvas
            </Link>{' '}
            first, then switch to "My whole topology" here to generate every device's config at
            once.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

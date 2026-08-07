import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Pill } from '../../../components/ui/Pill'
import { Button } from '../../../components/ui/Button'
import { ExportButton } from '../../../components/ui/ExportButton'
import { DeviceIcon, type DeviceIconKind } from '../../diagram/DeviceIcons'
import { useDiagramExport } from '../../../hooks/useDiagramExport'
import { parseCIDR, parseIPv4 } from '../../../lib/validation/ip'
import { analyzeIPv6 } from '../../../lib/calculations/ipv6'

const VIEW_WIDTH = 100
const VIEW_HEIGHT = 58
const NODE_SIZE = 8
const EDGE_MARGIN = 3
// Exported so the device config generator (v1.9) can read the same saved
// topology for its "generate from my topology" picker, without a second,
// independently-drifting copy of the storage key or shape.
export const STORAGE_KEY = 'packetnova-topology-canvas'

export interface CanvasNode {
  id: string
  kind: DeviceIconKind
  label: string
  x: number
  y: number
  /** Optional IP/CIDR, e.g. "192.168.1.1/24" -- unlocks "open in" links to
   * the relevant IP tools, pre-filled with this exact value. */
  address?: string
}

export interface CanvasLink {
  id: string
  from: string
  to: string
  /** Optional MTU in bytes -- unlocks an "open in MTU calculator" link. */
  mtu?: string
  /** Optional VLAN ID -- unlocks an "open in VLAN calculator" link, for a
   * link standing in for a trunk carrying a specific VLAN. */
  vlanId?: string
}

interface ToolQuickLink {
  label: string
  to: string
}

// What "tool integration" actually means here: a selected node/link with
// enough optional data filled in surfaces direct links into the exact
// tool that data is for, pre-filled via the same URL query params those
// tools already read for permalink state (v1.1) -- no new plumbing on
// the tool side beyond the two that didn't have it yet (route lookup
// simulator's destination, MTU calculator's mtu).
function buildNodeToolLinks(node: CanvasNode): ToolQuickLink[] {
  const links: ToolQuickLink[] = []
  const address = node.address?.trim()
  // Quick-links are only worth offering once the text actually looks like
  // the kind of address each destination tool expects -- otherwise it's a
  // dead-end link to a tool that can't do anything with what got typed.
  // Checked per-link against what that specific tool needs (a bare host
  // vs. a full CIDR), rather than one blanket gate for the whole address,
  // since e.g. a host with no prefix still has a real IP to look up.
  if (address) {
    const encoded = encodeURIComponent(address)
    if (address.includes(':')) {
      if (analyzeIPv6(address).ok) {
        links.push({ label: 'IPv6 calculator', to: `/tools/ipv6-calculator?addr=${encoded}` })
      }
    } else {
      const [host, prefix] = address.split('/')
      const isValidCidr = Boolean(parseCIDR(address))
      if (isValidCidr) {
        links.push({ label: 'CIDR calculator', to: `/tools/cidr-calculator?cidr=${encoded}` })
        links.push({ label: 'Subnet calculator', to: `/tools/subnet-calculator?cidr=${encoded}` })
        links.push({
          label: 'Network address calculator',
          to: `/tools/network-address-calculator?cidr=${encoded}`,
        })
        links.push({
          label: 'Broadcast calculator',
          to: `/tools/broadcast-calculator?cidr=${encoded}`,
        })
      }
      if ((node.kind === 'router' || node.kind === 'vpn-gateway') && host && parseIPv4(host)) {
        links.push({
          label: 'Route lookup simulator',
          to: `/tools/route-lookup-simulator?destination=${encodeURIComponent(host)}`,
        })
      }
      if (isValidCidr && host && prefix) {
        links.push({
          label: 'Generate device config',
          to: `/tools/device-config-generator?hostname=${encodeURIComponent(node.label)}&addr=${encodeURIComponent(host)}&prefix=${encodeURIComponent(prefix)}`,
        })
      }
    }
  }
  return links
}

function buildLinkToolLinks(link: CanvasLink): ToolQuickLink[] {
  const links: ToolQuickLink[] = []
  if (link.mtu?.trim()) {
    links.push({
      label: 'MTU calculator',
      to: `/tools/mtu-calculator?mtu=${encodeURIComponent(link.mtu.trim())}`,
    })
  }
  if (link.vlanId?.trim()) {
    links.push({
      label: 'VLAN calculator',
      to: `/tools/vlan-calculator?vlan=${encodeURIComponent(link.vlanId.trim())}`,
    })
  }
  return links
}

export interface StoredTopology {
  nodes: CanvasNode[]
  links: CanvasLink[]
}

const DEVICE_KINDS: { kind: DeviceIconKind; label: string }[] = [
  { kind: 'router', label: 'Router' },
  { kind: 'switch', label: 'Switch' },
  { kind: 'firewall', label: 'Firewall' },
  { kind: 'host', label: 'Host' },
  { kind: 'vpn-gateway', label: 'VPN gateway' },
]

// Node and link IDs are deliberately prefixed ("n"/"l") into separate
// namespaces -- selection is looked up by a single selectedId across both
// arrays (nodes first, then links), so a node and a link that happened to
// share the same bare numeric ID would make a link selection silently
// misread as a node selection whenever nodes.find() matched first.
const DEFAULT_NODES: CanvasNode[] = [
  { id: 'n1', kind: 'router', label: 'Router 1', x: 50, y: 12 },
  { id: 'n2', kind: 'switch', label: 'Switch 1', x: 25, y: 32 },
  { id: 'n3', kind: 'switch', label: 'Switch 2', x: 75, y: 32 },
  { id: 'n4', kind: 'host', label: 'Host 1', x: 15, y: 50 },
  { id: 'n5', kind: 'host', label: 'Host 2', x: 35, y: 50 },
]

const DEFAULT_LINKS: CanvasLink[] = [
  { id: 'l1', from: 'n1', to: 'n2' },
  { id: 'l2', from: 'n1', to: 'n3' },
  { id: 'l3', from: 'n2', to: 'n4' },
  { id: 'l4', from: 'n2', to: 'n5' },
]

function loadStoredTopology(): StoredTopology {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
        return { nodes: parsed.nodes, links: parsed.links }
      }
    }
  } catch {
    // Corrupt or inaccessible storage -- fall through to the starter topology.
  }
  return { nodes: DEFAULT_NODES, links: DEFAULT_LINKS }
}

function clientToViewBox(svg: SVGSVGElement, clientX: number, clientY: number) {
  const rect = svg.getBoundingClientRect()
  const x = ((clientX - rect.left) / rect.width) * VIEW_WIDTH
  const y = ((clientY - rect.top) / rect.height) * VIEW_HEIGHT
  return {
    x: Math.min(VIEW_WIDTH - EDGE_MARGIN, Math.max(EDGE_MARGIN, x)),
    y: Math.min(VIEW_HEIGHT - EDGE_MARGIN, Math.max(EDGE_MARGIN, y)),
  }
}

type Mode = 'move' | 'place' | 'link'

export function TopologyBuilder() {
  const initial = useRef(loadStoredTopology())
  const [nodes, setNodes] = useState<CanvasNode[]>(initial.current.nodes)
  const [links, setLinks] = useState<CanvasLink[]>(initial.current.links)
  const [mode, setMode] = useState<Mode>('move')
  const [placingKind, setPlacingKind] = useState<DeviceIconKind | null>(null)
  const [linkStart, setLinkStart] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)

  const svgRef = useRef<SVGSVGElement>(null)
  const skipNextSave = useRef(true)
  const nextNodeId = useRef(nodes.length + 1)
  const nextLinkId = useRef(links.length + 1)

  const { ref: exportRef, exportAs, pending } = useDiagramExport<HTMLDivElement>('topology-canvas')

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, links }))
  }, [nodes, links])

  // Kept current via their own effects rather than the listener effect's
  // dependency array -- deleteSelected reads selectedId/nodes directly,
  // and while dragging a node, handleSvgPointerMove calls setNodes on
  // every native pointermove event, which previously meant the listener
  // effect's cleanup+setup (removeEventListener/addEventListener) ran
  // dozens of times a second during the single most interactive action
  // this tool has, purely to keep a listener that only actually needs the
  // *current* values at the moment a key is pressed, not at attach time.
  const selectedIdRef = useRef(selectedId)
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])
  const deleteSelectedRef = useRef(deleteSelected)
  useEffect(() => {
    deleteSelectedRef.current = deleteSelected
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (event.key === 'Escape') {
        setMode('move')
        setPlacingKind(null)
        setLinkStart(null)
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIdRef.current) {
        event.preventDefault()
        deleteSelectedRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function defaultLabel(kind: DeviceIconKind): string {
    const niceName = DEVICE_KINDS.find((d) => d.kind === kind)?.label ?? kind
    const count = nodes.filter((n) => n.kind === kind).length + 1
    return `${niceName} ${count}`
  }

  function selectPaletteKind(kind: DeviceIconKind) {
    if (mode === 'place' && placingKind === kind) {
      setMode('move')
      setPlacingKind(null)
      return
    }
    setMode('place')
    setPlacingKind(kind)
    setLinkStart(null)
  }

  function toggleLinkMode() {
    if (mode === 'link') {
      setMode('move')
      setLinkStart(null)
      return
    }
    setMode('link')
    setPlacingKind(null)
    setSelectedId(null)
  }

  // Pointerdown, not click -- a node/link's own pointerdown handler stops
  // propagation, so this only ever fires for a press that actually started
  // on the empty canvas background. Click can't be used for this: once a
  // node press calls setPointerCapture (for dragging), the browser
  // retargets the *synthesized* click event straight to the SVG itself
  // rather than letting it bubble from the node, which bypassed the
  // node's stopPropagation entirely and cleared the selection that same
  // press had just set.
  function handleCanvasPointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    if (mode === 'place' && placingKind) {
      const { x, y } = clientToViewBox(svg, event.clientX, event.clientY)
      const id = `n${nextNodeId.current++}`
      const newNode: CanvasNode = { id, kind: placingKind, label: defaultLabel(placingKind), x, y }
      setNodes((current) => [...current, newNode])
      setSelectedId(id)
      return
    }
    setSelectedId(null)
    setLinkStart(null)
  }

  function handleNodePointerDown(event: ReactPointerEvent<SVGGElement>, nodeId: string) {
    event.stopPropagation()
    // preventDefault, not just stopPropagation -- without it, the browser's
    // own default action for a mousedown-and-drag starting on an SVG <text>
    // element (native text selection) still runs alongside the custom drag
    // logic below, which is what was actually happening instead of a drag.
    event.preventDefault()
    if (mode === 'place') return
    if (mode === 'link') {
      if (!linkStart) {
        setLinkStart(nodeId)
        return
      }
      if (linkStart === nodeId) {
        setLinkStart(null)
        return
      }
      const alreadyLinked = links.some(
        (l) =>
          (l.from === linkStart && l.to === nodeId) || (l.from === nodeId && l.to === linkStart),
      )
      if (!alreadyLinked) {
        const id = `l${nextLinkId.current++}`
        setLinks((current) => [...current, { id, from: linkStart, to: nodeId }])
      }
      setLinkStart(null)
      return
    }
    setSelectedId(nodeId)
    setDraggingNodeId(nodeId)
    svgRef.current?.setPointerCapture(event.pointerId)
  }

  function handleSvgPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingNodeId || !svgRef.current) return
    const { x, y } = clientToViewBox(svgRef.current, event.clientX, event.clientY)
    setNodes((current) => current.map((n) => (n.id === draggingNodeId ? { ...n, x, y } : n)))
  }

  function handleSvgPointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (draggingNodeId) svgRef.current?.releasePointerCapture(event.pointerId)
    setDraggingNodeId(null)
  }

  function handleLinkPointerDown(event: ReactPointerEvent<SVGLineElement>, linkId: string) {
    event.stopPropagation()
    if (mode !== 'move') return
    setSelectedId(linkId)
  }

  function deleteSelected() {
    if (!selectedId) return
    if (nodes.some((n) => n.id === selectedId)) {
      setNodes((current) => current.filter((n) => n.id !== selectedId))
      setLinks((current) => current.filter((l) => l.from !== selectedId && l.to !== selectedId))
    } else {
      setLinks((current) => current.filter((l) => l.id !== selectedId))
    }
    setSelectedId(null)
  }

  function resetTopology() {
    if (!window.confirm('Clear the whole topology and start over?')) return
    setNodes([])
    setLinks([])
    setSelectedId(null)
    setLinkStart(null)
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null
  const selectedLink = selectedNode ? null : (links.find((l) => l.id === selectedId) ?? null)

  return (
    <ToolPageLayout
      category="Utilities"
      title="Topology canvas"
      description="Build a network topology by hand -- place devices, draw links between them, export as PNG/SVG. Saves automatically in this browser, no account needed."
      related={[{ to: '/tools/device-config-generator', label: 'Device config generator' }]}
      fullWidth={
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-fg-muted">Place:</span>
            {DEVICE_KINDS.map((device) => (
              <Pill
                key={device.kind}
                active={mode === 'place' && placingKind === device.kind}
                onClick={() => selectPaletteKind(device.kind)}
              >
                {device.label}
              </Pill>
            ))}
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <Pill active={mode === 'link'} onClick={toggleLinkMode}>
              {mode === 'link'
                ? linkStart
                  ? 'Click the 2nd device…'
                  : 'Click two devices to link'
                : 'Draw links'}
            </Pill>
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <ExportButton exportAs={exportAs} pending={pending} />
            <Button variant="secondary" onClick={resetTopology} className="ml-auto">
              Clear all
            </Button>
          </div>

          <div ref={exportRef}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleSvgPointerMove}
              onPointerUp={handleSvgPointerUp}
              className={`w-full touch-none select-none rounded-lg border border-border bg-bg ${
                mode === 'place' ? 'cursor-crosshair' : mode === 'link' ? 'cursor-pointer' : ''
              }`}
              style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}` }}
              role="img"
              aria-label="Topology canvas -- drag devices to reposition, click Draw links then two devices to connect them"
            >
              {links.map((link) => {
                const from = nodeById.get(link.from)
                const to = nodeById.get(link.to)
                if (!from || !to) return null
                const isSelected = selectedLink?.id === link.id
                return (
                  <g key={link.id}>
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="transparent"
                      strokeWidth={3}
                      onPointerDown={(e) => handleLinkPointerDown(e, link.id)}
                      className={mode === 'move' ? 'cursor-pointer' : ''}
                    />
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isSelected ? 'var(--color-accent)' : 'var(--color-border)'}
                      strokeWidth={isSelected ? 1 : 0.6}
                      pointerEvents="none"
                    />
                  </g>
                )
              })}

              {mode === 'link' &&
                linkStart &&
                (() => {
                  const start = nodeById.get(linkStart)
                  return start ? (
                    <circle
                      cx={start.x}
                      cy={start.y}
                      r={(NODE_SIZE / 2) * 1.4}
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth={1}
                      strokeDasharray="2 1.5"
                    />
                  ) : null
                })()}

              {nodes.map((node) => {
                const isSelected = selectedId === node.id
                return (
                  <g
                    key={node.id}
                    onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                    className={
                      mode === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                    }
                  >
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={(NODE_SIZE / 2) * 1.5}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={0.8}
                      />
                    )}
                    <DeviceIcon
                      kind={node.kind}
                      x={node.x}
                      y={node.y}
                      size={NODE_SIZE}
                      fill="var(--color-surface)"
                      stroke={isSelected ? 'var(--color-accent)' : 'var(--color-fg-muted)'}
                    />
                    <text
                      x={node.x}
                      y={node.y + NODE_SIZE / 2 + 4.5}
                      textAnchor="middle"
                      fontSize={3.2}
                      fontFamily="var(--font-mono)"
                      fill="var(--color-fg-muted)"
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {(selectedNode || selectedLink) && (
            <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center gap-3">
                {selectedNode && (
                  <>
                    <span className="text-xs font-medium text-fg-muted">Selected device</span>
                    <input
                      value={selectedNode.label}
                      onChange={(e) => {
                        const label = e.target.value
                        setNodes((current) =>
                          current.map((n) => (n.id === selectedNode.id ? { ...n, label } : n)),
                        )
                      }}
                      className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
                    />
                  </>
                )}
                {selectedLink && (
                  <span className="text-sm">
                    Selected link:{' '}
                    <span className="font-mono text-fg-muted">
                      {nodeById.get(selectedLink.from)?.label} &ndash;{' '}
                      {nodeById.get(selectedLink.to)?.label}
                    </span>
                  </span>
                )}
                <Button variant="secondary" onClick={deleteSelected} className="ml-auto">
                  Delete
                </Button>
              </div>

              {selectedNode && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-fg-subtle" htmlFor="node-address-input">
                    Address (optional):
                  </label>
                  <input
                    id="node-address-input"
                    value={selectedNode.address ?? ''}
                    onChange={(e) => {
                      const address = e.target.value
                      setNodes((current) =>
                        current.map((n) => (n.id === selectedNode.id ? { ...n, address } : n)),
                      )
                    }}
                    placeholder="192.168.1.1/24"
                    spellCheck={false}
                    className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-1.5 font-mono text-sm text-fg focus:border-accent focus:outline-none"
                  />
                </div>
              )}

              {selectedLink && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-fg-subtle" htmlFor="link-mtu-input">
                      MTU (optional):
                    </label>
                    <input
                      id="link-mtu-input"
                      value={selectedLink.mtu ?? ''}
                      onChange={(e) => {
                        const mtu = e.target.value
                        setLinks((current) =>
                          current.map((l) => (l.id === selectedLink.id ? { ...l, mtu } : l)),
                        )
                      }}
                      placeholder="1500"
                      className="w-24 rounded-md border border-border bg-bg px-3 py-1.5 font-mono text-sm text-fg focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-fg-subtle" htmlFor="link-vlan-input">
                      VLAN (optional):
                    </label>
                    <input
                      id="link-vlan-input"
                      value={selectedLink.vlanId ?? ''}
                      onChange={(e) => {
                        const vlanId = e.target.value
                        setLinks((current) =>
                          current.map((l) => (l.id === selectedLink.id ? { ...l, vlanId } : l)),
                        )
                      }}
                      placeholder="100"
                      className="w-24 rounded-md border border-border bg-bg px-3 py-1.5 font-mono text-sm text-fg focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(() => {
                const toolLinks = selectedNode
                  ? buildNodeToolLinks(selectedNode)
                  : selectedLink
                    ? buildLinkToolLinks(selectedLink)
                    : []
                if (toolLinks.length === 0) return null
                return (
                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <span className="text-xs text-fg-subtle">Open in:</span>
                    {toolLinks.map((toolLink) => (
                      <Link
                        key={toolLink.to}
                        to={toolLink.to}
                        className="rounded-full border border-border px-3 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-accent/40 hover:text-fg"
                      >
                        {toolLink.label}
                      </Link>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          <p className="text-xs text-fg-subtle">
            {nodes.length} device{nodes.length === 1 ? '' : 's'}, {links.length} link
            {links.length === 1 ? '' : 's'} -- saved automatically in this browser. Drag a device to
            reposition it, click it to select and rename it, or press Delete/Backspace to remove
            whatever's selected.
          </p>
        </div>
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Everything here lives in this browser's local storage -- nothing is uploaded, there's no
            account, and it persists across visits until you clear it or clear your browser data.
            Positions, device types, and link connections are all saved on every change. Give a
            device an address, or a link an MTU or VLAN, and an "Open in" row appears under the
            selection panel linking straight into the matching calculator, pre-filled with that
            exact value.
          </p>
        }
        whenToUseThis={
          <p>
            Sketch out a network you're troubleshooting, designing, or explaining to someone else --
            a quick visual reference that's faster to build than a full diagramming tool, and that
            you can export as an image to drop into a ticket, doc, or chat. Add addresses and link
            properties as you go to jump directly into the CIDR, subnet, MTU, VLAN, or route-lookup
            math for any specific piece of it, instead of retyping values into a separate tool.
          </p>
        }
        commonMistakes={
          <p>
            Forgetting you're still in "Draw links" or "Place" mode and clicking around expecting to
            select or drag -- both modes stay active until you click the same palette button again
            or press Escape, shown by which pill is highlighted.
          </p>
        }
        troubleshootingTips={
          <p>
            If a device won't drag, check the toolbar -- dragging only works in the default mode,
            not while "Place" or "Draw links" is active. If your topology disappeared, check whether
            you're in a private/incognito window (local storage doesn't persist there) or recently
            cleared site data.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

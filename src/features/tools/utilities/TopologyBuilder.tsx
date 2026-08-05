import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Pill } from '../../../components/ui/Pill'
import { Button } from '../../../components/ui/Button'
import { ExportButton } from '../../../components/ui/ExportButton'
import { DeviceIcon, type DeviceIconKind } from '../../diagram/DeviceIcons'
import { useDiagramExport } from '../../../hooks/useDiagramExport'

const VIEW_WIDTH = 100
const VIEW_HEIGHT = 58
const NODE_SIZE = 8
const EDGE_MARGIN = 3
const STORAGE_KEY = 'packetnova-topology-canvas'

interface CanvasNode {
  id: string
  kind: DeviceIconKind
  label: string
  x: number
  y: number
}

interface CanvasLink {
  id: string
  from: string
  to: string
}

interface StoredTopology {
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

const DEFAULT_NODES: CanvasNode[] = [
  { id: '1', kind: 'router', label: 'Router 1', x: 50, y: 12 },
  { id: '2', kind: 'switch', label: 'Switch 1', x: 25, y: 32 },
  { id: '3', kind: 'switch', label: 'Switch 2', x: 75, y: 32 },
  { id: '4', kind: 'host', label: 'Host 1', x: 15, y: 50 },
  { id: '5', kind: 'host', label: 'Host 2', x: 35, y: 50 },
]

const DEFAULT_LINKS: CanvasLink[] = [
  { id: '1', from: '1', to: '2' },
  { id: '2', from: '1', to: '3' },
  { id: '3', from: '2', to: '4' },
  { id: '4', from: '2', to: '5' },
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (event.key === 'Escape') {
        setMode('move')
        setPlacingKind(null)
        setLinkStart(null)
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault()
        deleteSelected()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, nodes, links])

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
      const id = String(nextNodeId.current++)
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
        const id = String(nextLinkId.current++)
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
      description="Build a network topology by hand -- place devices, draw links between them. Saves automatically in this browser, no account needed."
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
            <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3">
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
              <Button variant="secondary" onClick={deleteSelected}>
                Delete
              </Button>
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
            Positions, device types, and link connections are all saved on every change.
          </p>
        }
        whenToUseThis={
          <p>
            Sketch out a network you're troubleshooting, designing, or explaining to someone else --
            a quick visual reference that's faster to build than a full diagramming tool, and that
            you can export as an image to drop into a ticket, doc, or chat.
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

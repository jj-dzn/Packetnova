import { DeviceIcon, type DeviceIconKind } from './DeviceIcons'

export interface TopologyNode {
  id: string
  x: number
  y: number
  label: string
  sublabel?: string
  /** CSS custom property values (e.g. 'var(--color-accent-alt)') -- callers
   * already know their own semantic state (visited/active/root/whatever a
   * given diagram means by "highlighted"), this just draws it rather than
   * trying to model every visualizer's state machine itself. */
  fill?: string
  stroke?: string
  strokeWidth?: number
  radius?: number
  icon?: DeviceIconKind
}

export interface TopologyEdge {
  from: string
  to: string
  label?: string | number
  stroke?: string
  strokeWidth?: number
  dashed?: boolean
}

interface TopologyCanvasProps {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  viewWidth: number
  viewHeight: number
  className?: string
}

const DEFAULT_RADIUS = 22

// Freeform node-and-link SVG layout -- extracted from the OSPF SPF
// visualizer's original inline rendering, which STP overview's port-role
// example had independently reimplemented almost identically (same circle+
// line+label shape, same var(--color-*) tokens). One primitive now backs
// both, plus anywhere else on the site that needs to draw a small network
// topology: pass positioned nodes and edges, get the same visual grammar
// every time instead of a third hand-rolled SVG.
export function TopologyCanvas({
  nodes,
  edges,
  viewWidth,
  viewHeight,
  className,
}: TopologyCanvasProps) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className={className ?? 'mx-auto w-full max-w-xl'}
    >
      {edges.map((edge, index) => {
        const a = nodeById.get(edge.from)
        const b = nodeById.get(edge.to)
        if (!a || !b) return null
        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2
        const stroke = edge.stroke ?? 'var(--color-border)'
        return (
          <g key={`${edge.from}-${edge.to}-${index}`}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeWidth={edge.strokeWidth ?? 1.5}
              strokeDasharray={edge.dashed ? '5 4' : undefined}
            />
            {edge.label !== undefined && (
              <>
                {(() => {
                  const labelText = String(edge.label)
                  // Sized for the common case (short numeric costs like "10")
                  // but grows for longer labels instead of letting them
                  // overflow a fixed-width backdrop -- 6px/char at this
                  // font-mono 10px size is an approximation, not a measured
                  // width, so it errs slightly wide rather than clipping.
                  const labelWidth = Math.max(20, labelText.length * 6 + 8)
                  return (
                    <rect
                      x={midX - labelWidth / 2}
                      y={midY - 9}
                      width={labelWidth}
                      height={14}
                      fill="var(--color-bg)"
                      opacity={0.85}
                    />
                  )
                })()}
                <text
                  x={midX}
                  y={midY + 1}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fill={stroke}
                >
                  {edge.label}
                </text>
              </>
            )}
          </g>
        )
      })}

      {nodes.map((node) => {
        const radius = node.radius ?? DEFAULT_RADIUS
        const fill = node.fill ?? 'var(--color-surface)'
        const stroke = node.stroke ?? 'var(--color-border)'
        return (
          <g key={node.id}>
            {node.icon ? (
              <DeviceIcon
                kind={node.icon}
                x={node.x}
                y={node.y}
                size={radius * 1.6}
                fill={fill}
                stroke={stroke}
              />
            ) : (
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={node.strokeWidth ?? 1.5}
              />
            )}
            <text
              x={node.x}
              y={node.icon ? node.y + radius + 12 : node.y - 3}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-mono)"
              fill={
                node.icon
                  ? 'var(--color-fg)'
                  : fill === 'var(--color-surface)'
                    ? 'var(--color-fg)'
                    : 'var(--color-bg)'
              }
            >
              {node.label}
            </text>
            {node.sublabel !== undefined && (
              <text
                x={node.x}
                y={node.icon ? node.y + radius + 24 : node.y + 11}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill={
                  node.icon
                    ? 'var(--color-fg-muted)'
                    : fill === 'var(--color-surface)'
                      ? 'var(--color-fg-muted)'
                      : 'var(--color-bg)'
                }
              >
                {node.sublabel}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

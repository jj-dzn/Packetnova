export type DeviceIconKind = 'router' | 'switch' | 'firewall' | 'host' | 'vpn-gateway'

interface GlyphProps {
  x: number
  y: number
  size: number
  fill: string
  stroke: string
}

// Simple, geometric device glyphs matching the logo's node-and-connection
// visual language (circles, straight connectors, no gradients here since
// these need to recolor per node state) -- deliberately not literal device
// art. The design system rules out router/cloud clichés explicitly; these
// read as "a routing point," "a multi-port device," "a boundary," not
// miniature photographs of hardware.

function RouterGlyph({ x, y, size, fill, stroke }: GlyphProps) {
  const r = size / 2
  const spoke = r * 0.45
  return (
    <g>
      <line
        x1={x}
        y1={y - r}
        x2={x}
        y2={y - r - spoke}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={x}
        y1={y + r}
        x2={x}
        y2={y + r + spoke}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={x - r}
        y1={y}
        x2={x - r - spoke}
        y2={y}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={x + r}
        y1={y}
        x2={x + r + spoke}
        y2={y}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />
    </g>
  )
}

function SwitchGlyph({ x, y, size, fill, stroke }: GlyphProps) {
  const w = size * 1.15
  const h = size * 0.66
  const left = x - w / 2
  const top = y - h / 2
  const portCount = 4
  const portWidth = w * 0.12
  const gap = (w - portCount * portWidth) / (portCount + 1)
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={3}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      {Array.from({ length: portCount }, (_, i) => {
        const px = left + gap * (i + 1) + portWidth * i
        return (
          <rect
            key={i}
            x={px}
            y={top + h - 3}
            width={portWidth}
            height={4}
            rx={0.5}
            fill={stroke}
          />
        )
      })}
    </g>
  )
}

function FirewallGlyph({ x, y, size, fill, stroke }: GlyphProps) {
  const halfW = size * 0.42
  const top = y - size / 2
  const waistY = y + size * 0.1
  const bottom = y + size / 2
  return (
    <path
      d={`M ${x - halfW} ${top + 6}
          Q ${x - halfW} ${top} ${x - halfW + 6} ${top}
          L ${x + halfW - 6} ${top}
          Q ${x + halfW} ${top} ${x + halfW} ${top + 6}
          L ${x + halfW} ${waistY}
          Q ${x + halfW} ${bottom} ${x} ${bottom}
          Q ${x - halfW} ${bottom} ${x - halfW} ${waistY}
          Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  )
}

// A monitor-on-a-stand -- reads as "end host," distinct from the switch's
// wide ported rectangle and the router's circle-with-spokes.
function HostGlyph({ x, y, size, fill, stroke }: GlyphProps) {
  const w = size * 0.9
  const h = size * 0.62
  const left = x - w / 2
  const top = y - size / 2
  const standWidth = size * 0.28
  const standHeight = size * 0.12
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={w}
        height={h}
        rx={2.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <line
        x1={x}
        y1={top + h}
        x2={x}
        y2={top + h + standHeight}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <line
        x1={x - standWidth / 2}
        y1={top + h + standHeight}
        x2={x + standWidth / 2}
        y2={top + h + standHeight}
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </g>
  )
}

// A hexagon -- a "boundary/checkpoint" read distinct from the firewall's
// shield, for a device whose defining trait is the encrypted tunnel it
// terminates rather than the traffic policy it enforces.
function VpnGatewayGlyph({ x, y, size, fill, stroke }: GlyphProps) {
  const r = size / 2
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`
  }).join(' ')
  return (
    <polygon points={points} fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" />
  )
}

interface DeviceIconProps extends GlyphProps {
  kind: DeviceIconKind
}

export function DeviceIcon({ kind, ...glyphProps }: DeviceIconProps) {
  if (kind === 'router') return <RouterGlyph {...glyphProps} />
  if (kind === 'switch') return <SwitchGlyph {...glyphProps} />
  if (kind === 'host') return <HostGlyph {...glyphProps} />
  if (kind === 'vpn-gateway') return <VpnGatewayGlyph {...glyphProps} />
  return <FirewallGlyph {...glyphProps} />
}

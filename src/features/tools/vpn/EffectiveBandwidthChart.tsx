import { calculateEffectiveBandwidth } from '../../../lib/calculations/bandwidth'

interface EffectiveBandwidthChartProps {
  rawBandwidthMbps: number
  overheadBytes: number
  currentPacketSize: number
}

const MIN_PACKET_SIZE = 64 // smallest Ethernet frame
const MAX_PACKET_SIZE = 9000 // jumbo frame, same ceiling as the MTU calculator's slider
const SAMPLE_COUNT = 60
const WIDTH = 320
const HEIGHT = 120
const PAD_LEFT = 8
const PAD_RIGHT = 8
const PAD_TOP = 8
const PAD_BOTTOM = 20

function samplePoints(rawBandwidthMbps: number, overheadBytes: number): { x: number; y: number }[] {
  const start = Math.max(MIN_PACKET_SIZE, overheadBytes + 1)
  if (start >= MAX_PACKET_SIZE) return []

  const points: { x: number; y: number }[] = []
  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const packetSize = start + ((MAX_PACKET_SIZE - start) * i) / SAMPLE_COUNT
    const calc = calculateEffectiveBandwidth(rawBandwidthMbps, overheadBytes, packetSize)
    if (calc.ok) points.push({ x: packetSize, y: calc.result.effectiveBandwidthMbps })
  }
  return points
}

// Effective bandwidth climbs steeply as packet size grows past the fixed
// per-packet overhead, then flattens out toward the raw bandwidth ceiling --
// a curve that's genuinely hard to picture from a single-point calculator,
// which is exactly what this chart is for. Built as a hand-rolled SVG path
// (no charting library in this project) sharing the same visual language --
// axis labels, accent fill/stroke -- as the site's other diagram primitives.
export function EffectiveBandwidthChart({
  rawBandwidthMbps,
  overheadBytes,
  currentPacketSize,
}: EffectiveBandwidthChartProps) {
  const points = samplePoints(rawBandwidthMbps, overheadBytes)
  if (points.length < 2) {
    return (
      <p className="text-xs text-fg-subtle">
        Not enough headroom above the overhead to chart a curve -- lower the overhead or raise the
        packet size range.
      </p>
    )
  }

  const minX = points[0]!.x
  const maxX = points[points.length - 1]!.x
  const maxY = Math.max(...points.map((p) => p.y), rawBandwidthMbps)

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  const toSvgX = (x: number) => PAD_LEFT + ((x - minX) / (maxX - minX)) * plotWidth
  const toSvgY = (y: number) => PAD_TOP + plotHeight - (y / maxY) * plotHeight

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.y).toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L ${toSvgX(maxX).toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} L ${toSvgX(minX).toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} Z`

  const clampedCurrent = Math.min(maxX, Math.max(minX, currentPacketSize))
  const currentCalc = calculateEffectiveBandwidth(rawBandwidthMbps, overheadBytes, clampedCurrent)
  const markerY = currentCalc.ok ? currentCalc.result.effectiveBandwidthMbps : null

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`Effective bandwidth versus packet size, from ${minX.toFixed(0)} to ${maxX.toFixed(0)} bytes`}
      >
        <path d={areaPath} className="fill-accent/10" />
        <path d={linePath} className="fill-none stroke-accent" strokeWidth={1.5} />
        {markerY !== null && (
          <circle
            cx={toSvgX(clampedCurrent)}
            cy={toSvgY(markerY)}
            r={3}
            className="fill-accent stroke-bg"
            strokeWidth={1.5}
          />
        )}
      </svg>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-fg-subtle">
        <span>{minX.toFixed(0)} B</span>
        <span>Packet size</span>
        <span>{maxX.toFixed(0)} B</span>
      </div>
    </div>
  )
}

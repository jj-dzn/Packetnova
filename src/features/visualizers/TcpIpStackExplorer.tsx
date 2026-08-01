import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import {
  OSI_LAYERS,
  TCP_IP_LAYERS,
  osiLayerColorClasses,
  tcpIpLayerColorClasses,
  type LayerColorClasses,
  type OsiLayer,
  type TcpIpLayer,
} from '../../content/reference/networkStackLayers'

const ROW_H = 56
const GAP_W = 40
const TOTAL_HEIGHT = OSI_LAYERS.length * ROW_H

type Selected = { side: 'osi'; layer: OsiLayer } | { side: 'tcpip'; layer: TcpIpLayer }

// Precomputed once at module load (not per-render): each TCP/IP layer,
// paired with its vertical center within the shared TOTAL_HEIGHT, in
// top-to-bottom order.
const TCP_IP_LAYERS_WITH_MID_Y: { layer: TcpIpLayer; midY: number }[] = (() => {
  let cursorY = 0
  return TCP_IP_LAYERS.map((layer) => {
    const groupHeight = layer.osiLayerNumbers.length * ROW_H
    const midY = cursorY + groupHeight / 2
    cursorY += groupHeight
    return { layer, midY }
  })
})()

// Replaces the old single-column layer-by-layer walkthrough: this page's
// whole premise is comparing TCP/IP against OSI, so it should actually show
// them side by side. Row heights on the OSI side are uniform; TCP/IP row
// heights are sized to the number of OSI layers each one absorbs, so the
// two columns' heights line up exactly and the connecting lines land at
// matching Y coordinates with no extra geometry needed.
export function TcpIpStackExplorer() {
  const [selected, setSelected] = useState<Selected>({ side: 'tcpip', layer: TCP_IP_LAYERS[0]! })

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="TCP/IP stack explorer"
      description="Compare the TCP/IP model against OSI, side by side -- click either stack to see how they line up."
    >
      <div className="flex flex-col gap-8">
        <div className="flex items-start justify-center gap-0 overflow-x-auto">
          <div className="w-32 shrink-0 sm:w-40">
            <ColumnHeading>OSI (7 layers)</ColumnHeading>
            <div
              style={{ height: TOTAL_HEIGHT }}
              className="flex flex-col overflow-hidden rounded-md border border-border"
            >
              {OSI_LAYERS.map((layer, index) => (
                <LayerRow
                  key={layer.number}
                  height={ROW_H}
                  bordered={index < OSI_LAYERS.length - 1}
                  label={`L${layer.number} ${layer.name}`}
                  colors={osiLayerColorClasses(layer.number)}
                  active={selected.side === 'osi' && selected.layer.number === layer.number}
                  highlighted={
                    selected.side === 'tcpip' &&
                    selected.layer.osiLayerNumbers.includes(layer.number)
                  }
                  onClick={() => setSelected({ side: 'osi', layer })}
                />
              ))}
            </div>
          </div>

          <svg
            width={GAP_W}
            height={TOTAL_HEIGHT}
            className="shrink-0 text-border"
            aria-hidden="true"
          >
            {TCP_IP_LAYERS_WITH_MID_Y.map(({ layer, midY }) => {
              const isActive = selected.side === 'tcpip' && selected.layer.number === layer.number
              return (
                <line
                  key={layer.number}
                  x1={0}
                  y1={midY}
                  x2={GAP_W}
                  y2={midY}
                  stroke="currentColor"
                  strokeWidth={isActive ? 2 : 1}
                  className={isActive ? 'text-accent' : undefined}
                />
              )
            })}
          </svg>

          <div className="w-32 shrink-0 sm:w-40">
            <ColumnHeading>TCP/IP (4 layers)</ColumnHeading>
            <div
              style={{ height: TOTAL_HEIGHT }}
              className="flex flex-col overflow-hidden rounded-md border border-border"
            >
              {TCP_IP_LAYERS.map((layer, index) => (
                <LayerRow
                  key={layer.number}
                  height={layer.osiLayerNumbers.length * ROW_H}
                  bordered={index < TCP_IP_LAYERS.length - 1}
                  label={`L${layer.number} ${layer.name}`}
                  colors={tcpIpLayerColorClasses(layer.number)}
                  active={selected.side === 'tcpip' && selected.layer.number === layer.number}
                  highlighted={
                    selected.side === 'osi' && layer.osiLayerNumbers.includes(selected.layer.number)
                  }
                  onClick={() => setSelected({ side: 'tcpip', layer })}
                />
              ))}
            </div>
          </div>
        </div>

        <div aria-live="polite">
          <h2 className="font-medium">
            {selected.side === 'osi' ? 'OSI' : 'TCP/IP'} -- L{selected.layer.number}{' '}
            {selected.layer.name}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">{selected.layer.description}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-fg-subtle">Examples</dt>
            <dd className="font-mono text-xs text-fg">{selected.layer.examples}</dd>
            <dt className="text-fg-subtle">Data unit</dt>
            <dd className="font-mono text-xs text-fg">{selected.layer.dataUnit}</dd>
          </dl>
        </div>
      </div>
    </VisualizerPageLayout>
  )
}

function ColumnHeading({ children }: { children: string }) {
  return (
    <p className="mb-2 text-center text-xs font-semibold tracking-wide text-fg-subtle uppercase">
      {children}
    </p>
  )
}

function LayerRow({
  height,
  bordered,
  label,
  colors,
  active,
  highlighted,
  onClick,
}: {
  height: number
  bordered: boolean
  label: string
  colors: LayerColorClasses
  active: boolean
  highlighted: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height }}
      className={`flex items-center justify-center border-l-4 px-2 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${colors.leftBorder} ${bordered ? 'border-b border-border' : ''} ${
        active
          ? `${colors.activeBg} ${colors.activeText}`
          : highlighted
            ? `${colors.activeBg} text-fg`
            : 'bg-bg text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
}

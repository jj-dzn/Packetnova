import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'
import { osiLayerColorClasses } from '../../content/reference/networkStackLayers'
import type { RelatedLink } from '../../components/ui/RelatedLinks'

export interface LayerInfo {
  number: number
  name: string
  description: string
  detail: string
  examples: string
  devices: string
  dataUnit: string
}

interface LayerExplorerProps {
  category: string
  title: string
  description: string
  layers: LayerInfo[]
  related?: RelatedLink[]
}

// Shared "click through a stack of named layers" visualizer -- backs the
// OSI model and TCP/IP stack explorers. Layers are listed highest-first
// (Application at the top), matching the encapsulation visualizer's
// top-down framing. Unlike the sequence-diagram visualizers, each layer
// here is independently reachable by clicking it directly (an "explorer"),
// not just by stepping linearly -- so unlike the flow/sequence visualizers,
// a StepNarration transcript isn't needed here: every layer's explanation
// is always one click away via the list below, not just reachable by
// rewinding through history.
export function LayerExplorer({
  category,
  title,
  description,
  layers,
  related,
}: LayerExplorerProps) {
  const player = useStepPlayer(layers.length)
  const current = layers[player.step]!

  return (
    <VisualizerPageLayout
      category={category}
      title={title}
      description={description}
      related={related}
    >
      <div
        tabIndex={0}
        onKeyDown={player.onKeyDown}
        aria-label={`${title}. Click a layer, or use the Previous and Next buttons, or the left and right arrow keys, to move between layers.`}
        className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex flex-col gap-1.5">
          {layers.map((layer, index) => {
            const colors = osiLayerColorClasses(layer.number)
            return (
              <button
                key={layer.number}
                type="button"
                onClick={() => player.goTo(index)}
                className={`rounded-md border border-border border-l-4 px-4 py-2 text-left text-sm transition-colors ${colors.leftBorder} ${
                  index === player.step
                    ? `${colors.activeBg} ${colors.activeText}`
                    : 'bg-bg text-fg-muted hover:text-fg'
                }`}
              >
                <span className="mr-2 font-mono text-xs">L{layer.number}</span>
                {layer.name}
              </button>
            )
          })}
        </div>

        <div aria-live="polite">
          <h2 className="font-medium">{current.name}</h2>
          <p className="mt-1 text-sm text-fg-muted">{current.description}</p>
          <p className="mt-3 text-sm text-fg-muted">{current.detail}</p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-fg-subtle">Examples</dt>
            <dd className="font-mono text-xs text-fg">{current.examples}</dd>
            <dt className="text-fg-subtle">Typical devices</dt>
            <dd className="font-mono text-xs text-fg">{current.devices}</dd>
            <dt className="text-fg-subtle">Data unit</dt>
            <dd className="font-mono text-xs text-fg">{current.dataUnit}</dd>
          </dl>
        </div>

        <StepControls player={player} totalSteps={layers.length} />
      </div>
    </VisualizerPageLayout>
  )
}

import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'
import { visualizers } from '../content/reference/visualizers'

const liveVisualizers = visualizers.filter((visualizer) => visualizer.slug).length
const allLive = liveVisualizers === visualizers.length

export function VisualizersPage() {
  return (
    <div className="py-16">
      <div className="mb-12 text-center">
        <Badge tone="accent">
          {liveVisualizers} of {visualizers.length} visualizers live
        </Badge>
        <h1 className="mt-4 text-2xl font-semibold">Visualizers</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Step-by-step animations of how protocols actually work, built for keyboard use and
          reduced-motion friendly.
          {!allLive && ' The rest ship incrementally in later milestones.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visualizers.map((visualizer) => (
          <PreviewCard
            key={visualizer.name}
            category="Visualizer"
            title={visualizer.name}
            description={visualizer.description}
            href={visualizer.slug ? `/visualizers/${visualizer.slug}` : undefined}
            comingSoon={!visualizer.slug}
          />
        ))}
      </div>
    </div>
  )
}

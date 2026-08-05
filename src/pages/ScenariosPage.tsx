import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'
import { scenarios } from '../content/reference/scenarios'

export function ScenariosPage() {
  return (
    <div className="py-16">
      <div className="mb-12 text-center">
        <Badge tone="accent">{scenarios.length} scenarios</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Scenarios</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Guided troubleshooting labs -- each one chains real PacketNova tools and visualizers into
          the same sequence you'd actually work through to diagnose the problem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <PreviewCard
            key={scenario.slug}
            category={scenario.category}
            title={scenario.title}
            description={scenario.symptom}
            href={`/scenarios/${scenario.slug}`}
            comingSoon={false}
            tag={scenario.format === 'branching' ? 'Branching + timed challenge' : undefined}
          />
        ))}
      </div>
    </div>
  )
}

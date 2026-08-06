import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'
import { scenarios } from '../content/reference/scenarios'

// Three branching scenarios next to seven linear ones is lopsided enough
// that a single undifferentiated grid (with only a small per-card badge as
// the tell) made visitors learn two different interaction models on the
// fly. Splitting into two labeled sections sets the expectation before a
// visitor ever clicks in, instead of after.
export function ScenariosPage() {
  const branching = scenarios.filter((scenario) => scenario.format === 'branching')
  const linear = scenarios.filter((scenario) => scenario.format !== 'branching')

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

      <section className="mb-14">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-lg font-semibold">Branching scenarios</h2>
          <p className="mt-1.5 text-sm text-fg-muted">
            Real wrong turns, each with its own dead-end explanation -- not a straight read-through.
            Start a timed challenge on any of these for a scored, shareable result.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branching.map((scenario) => (
            <PreviewCard
              key={scenario.slug}
              category={scenario.category}
              title={scenario.title}
              description={scenario.symptom}
              href={`/scenarios/${scenario.slug}`}
              comingSoon={false}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 max-w-2xl">
          <h2 className="text-lg font-semibold">Guided walkthroughs</h2>
          <p className="mt-1.5 text-sm text-fg-muted">
            One straight path through the diagnosis, top to bottom -- read, follow along in the
            embedded tools, land on the fix.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {linear.map((scenario) => (
            <PreviewCard
              key={scenario.slug}
              category={scenario.category}
              title={scenario.title}
              description={scenario.symptom}
              href={`/scenarios/${scenario.slug}`}
              comingSoon={false}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

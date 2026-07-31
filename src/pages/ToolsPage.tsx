import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'
import { toolCategories } from '../content/reference/tools'

const totalTools = toolCategories.reduce((count, category) => count + category.tools.length, 0)
const liveTools = toolCategories.reduce(
  (count, category) => count + category.tools.filter((tool) => tool.slug).length,
  0,
)
const allLive = liveTools === totalTools

export function ToolsPage() {
  return (
    <div className="flex flex-col gap-16 py-16">
      <div className="text-center">
        <Badge tone="accent">
          {liveTools} of {totalTools} tools live
        </Badge>
        <h1 className="mt-4 text-2xl font-semibold">Tools</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Every calculator and reference tool on the roadmap, organized by category.
          {!allLive && ' The rest ship incrementally in later milestones.'}
        </p>
      </div>

      {toolCategories.map((category) => (
        <section key={category.slug}>
          <h2 className="mb-6 text-xl font-semibold">{category.label}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.tools.map((tool) => (
              <PreviewCard
                key={tool.name}
                category={category.label}
                title={tool.name}
                description={tool.description}
                href={tool.slug ? `/tools/${tool.slug}` : undefined}
                comingSoon={!tool.slug}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

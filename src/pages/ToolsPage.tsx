import { Badge } from '../components/ui/Badge'
import { PreviewCard } from '../components/ui/PreviewCard'
import { toolCategories } from '../content/reference/tools'

export function ToolsPage() {
  return (
    <div className="flex flex-col gap-16 py-16">
      <div className="text-center">
        <Badge tone="accent">48 tools planned</Badge>
        <h1 className="mt-4 text-2xl font-semibold">Tools</h1>
        <p className="mx-auto mt-2 max-w-xl text-fg-muted">
          Every calculator and reference tool on the roadmap, organized by category. Tools ship
          incrementally -- starting with the five IP tools in Milestone 6.
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
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

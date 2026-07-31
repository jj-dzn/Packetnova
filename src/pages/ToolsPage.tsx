import { useState } from 'react'
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const visibleCategories = activeCategory
    ? toolCategories.filter((category) => category.slug === activeCategory)
    : toolCategories

  return (
    <div className="flex flex-col gap-12 py-16">
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

      <div className="flex flex-wrap items-center justify-center gap-2">
        <CategoryButton
          label="All"
          active={activeCategory === null}
          onClick={() => setActiveCategory(null)}
        />
        {toolCategories.map((category) => (
          <CategoryButton
            key={category.slug}
            label={`${category.label} (${category.tools.length})`}
            active={activeCategory === category.slug}
            onClick={() => setActiveCategory(category.slug)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-16">
        {visibleCategories.map((category) => (
          <section key={category.slug}>
            {activeCategory === null && (
              <h2 className="mb-6 text-xl font-semibold">{category.label}</h2>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  )
}

function CategoryButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-fg-muted hover:border-accent/40 hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
}

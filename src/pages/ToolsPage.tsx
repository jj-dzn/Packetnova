import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { PreviewCard } from '../components/ui/PreviewCard'
import { Pill } from '../components/ui/Pill'
import { toolCategories } from '../content/reference/tools'
import { useBookmarks } from '../hooks/useBookmarks'

const totalTools = toolCategories.reduce((count, category) => count + category.tools.length, 0)
const liveTools = toolCategories.reduce(
  (count, category) => count + category.tools.filter((tool) => tool.slug).length,
  0,
)
const allLive = liveTools === totalTools

const BOOKMARKED_FILTER = '__bookmarked__'

export function ToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { bookmarks } = useBookmarks()
  const showBookmarked = activeCategory === BOOKMARKED_FILTER
  const visibleCategories =
    activeCategory && !showBookmarked
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
        <Pill active={activeCategory === null} onClick={() => setActiveCategory(null)}>
          All
        </Pill>
        {toolCategories.map((category) => (
          <Pill
            key={category.slug}
            active={activeCategory === category.slug}
            onClick={() => setActiveCategory(category.slug)}
          >
            {category.label} ({category.tools.length})
          </Pill>
        ))}
        <Pill
          active={showBookmarked}
          onClick={() => setActiveCategory(showBookmarked ? null : BOOKMARKED_FILTER)}
        >
          Bookmarked ({bookmarks.length})
        </Pill>
      </div>

      {showBookmarked ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {bookmarks.length === 0 ? (
            <p className="col-span-full text-center text-fg-muted">
              Nothing bookmarked yet -- the star on any tool page saves it here.
            </p>
          ) : (
            bookmarks.map((item) => (
              <Link key={item.href} to={item.href} className="block">
                <Card interactive tilt className="flex h-full flex-col gap-3">
                  <Badge tone="accent">{item.category}</Badge>
                  <h3 className="font-medium">{item.title}</h3>
                </Card>
              </Link>
            ))
          )}
        </div>
      ) : (
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
      )}
    </div>
  )
}

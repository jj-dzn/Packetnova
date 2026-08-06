import { SectionHeader } from './SectionHeader'
import { PreviewCard } from '../../components/ui/PreviewCard'
import { useBookmarks } from '../../hooks/useBookmarks'

const SHOWN_COUNT = 4

// Only renders once something's actually bookmarked -- a first-time visitor
// sees nothing here, matching ContinuePathTeaser's same restraint. Reads
// straight from the shared bookmarks store, so a star toggled on any tool
// page shows up here with zero per-tool wiring.
export function BookmarksTeaser() {
  const { bookmarks } = useBookmarks()
  if (bookmarks.length === 0) return null

  return (
    <section className="py-14">
      <SectionHeader
        title="Bookmarked tools"
        subtitle="Saved in this browser, not an account"
        viewAllHref="/tools?category=__bookmarked__"
        viewAllLabel={`View all ${bookmarks.length}`}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bookmarks.slice(0, SHOWN_COUNT).map((item) => (
          <PreviewCard
            key={item.href}
            category={item.category}
            title={item.title}
            description={item.description ?? ''}
            href={item.href}
            comingSoon={false}
          />
        ))}
      </div>
    </section>
  )
}

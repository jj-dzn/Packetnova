import { useBookmarks, useIsBookmarked } from '../../hooks/useBookmarks'
import type { BookmarkedItem } from '../../lib/storage/bookmarks'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.5l-4.7 2.45.9-5.23-3.8-3.7 5.25-.76z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Star toggle used in ToolPageLayout/ReferencePageLayout's header -- reads
// and writes the shared bookmarks store, so it stays in sync with every
// other bookmark UI (the homepage "Continue where you left off" section,
// the Tools page bookmarked filter) without any prop drilling.
export function BookmarkButton({
  item,
  className = '',
}: {
  item: BookmarkedItem
  className?: string
}) {
  const bookmarked = useIsBookmarked(item.href)
  const { toggle } = useBookmarks()

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? `Remove ${item.title} from bookmarks` : `Bookmark ${item.title}`}
      className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        bookmarked ? 'text-accent' : 'text-fg-subtle hover:text-fg'
      } ${className}`}
    >
      <StarIcon filled={bookmarked} />
    </button>
  )
}

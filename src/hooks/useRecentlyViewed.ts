import { useEffect, useSyncExternalStore } from 'react'
import {
  getRecentlyViewed,
  recordVisit,
  subscribeToRecentlyViewed,
  type RecentItem,
} from '../lib/storage/recentlyViewed'

export function useRecentlyViewed() {
  return useSyncExternalStore(subscribeToRecentlyViewed, getRecentlyViewed, () => [])
}

// Records the current page as visited once per mount -- called from
// ToolPageLayout/ReferencePageLayout so every tool and reference page gets
// "continue where you left off" tracking for free, with no per-tool wiring.
export function useRecordVisit(item: Omit<RecentItem, 'visitedAt'> | null) {
  useEffect(() => {
    if (item) recordVisit(item)
    // Only the identity of what's being visited should re-trigger this --
    // not every render of the page that happens to hold it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.href])
}

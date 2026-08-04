import { useCallback, useSyncExternalStore } from 'react'
import {
  getBookmarks,
  isBookmarked,
  subscribeToBookmarks,
  toggleBookmark,
  type BookmarkedItem,
} from '../lib/storage/bookmarks'

export function useBookmarks() {
  const bookmarks = useSyncExternalStore(subscribeToBookmarks, getBookmarks, () => [])

  const toggle = useCallback((item: BookmarkedItem) => toggleBookmark(item), [])

  return { bookmarks, toggle }
}

export function useIsBookmarked(href: string) {
  return useSyncExternalStore(
    subscribeToBookmarks,
    () => isBookmarked(href),
    () => false,
  )
}

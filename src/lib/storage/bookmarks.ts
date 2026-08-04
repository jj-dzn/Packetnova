export interface BookmarkedItem {
  href: string
  title: string
  category: string
}

const STORAGE_KEY = 'packetnova:bookmarks'
const CHANGE_EVENT = 'packetnova:bookmarks-changed'

function parseStored(): BookmarkedItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Cached in memory so getBookmarks() returns a stable reference between
// writes -- useSyncExternalStore compares snapshots with Object.is, and a
// fresh array on every call would look like a change on every render.
let cache: BookmarkedItem[] = parseStored()

function writeAll(items: BookmarkedItem[]) {
  cache = items
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getBookmarks(): BookmarkedItem[] {
  return cache
}

export function isBookmarked(href: string): boolean {
  return cache.some((item) => item.href === href)
}

export function toggleBookmark(item: BookmarkedItem) {
  const next = cache.some((entry) => entry.href === item.href)
    ? cache.filter((entry) => entry.href !== item.href)
    : [item, ...cache]
  writeAll(next)
}

export function subscribeToBookmarks(callback: () => void): () => void {
  function handleStorageEvent(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      cache = parseStored()
      callback()
    }
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', handleStorageEvent)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

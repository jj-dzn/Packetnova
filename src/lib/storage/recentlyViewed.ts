export interface RecentItem {
  href: string
  title: string
  category: string
  visitedAt: number
}

const STORAGE_KEY = 'packetnova:recently-viewed'
const CHANGE_EVENT = 'packetnova:recently-viewed-changed'
const MAX_ENTRIES = 8

function parseStored(): RecentItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Cached in memory for the same reason as bookmarks.ts -- a stable
// reference between writes, required by useSyncExternalStore.
let cache: RecentItem[] = parseStored()

export function getRecentlyViewed(): RecentItem[] {
  return cache
}

// Moves the visited item to the front (most-recently-visited first),
// dropping any earlier entry for the same href instead of duplicating it,
// and caps the list so it stays a quick "pick up where you left off"
// glance, not a full history log.
export function recordVisit(item: Omit<RecentItem, 'visitedAt'>) {
  const deduped = cache.filter((entry) => entry.href !== item.href)
  cache = [{ ...item, visitedAt: Date.now() }, ...deduped].slice(0, MAX_ENTRIES)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeToRecentlyViewed(callback: () => void): () => void {
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

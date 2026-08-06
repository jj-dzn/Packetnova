export interface NotebookEntry {
  id: string
  href: string
  title: string
  category: string
  summary: string
  pinnedAt: number
}

const STORAGE_KEY = 'packetnova:notebook'
const CHANGE_EVENT = 'packetnova:notebook-changed'

function parseStored(): NotebookEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Cached in memory for the same reason as the bookmarks store -- a stable
// reference for useSyncExternalStore between writes.
let cache: NotebookEntry[] = parseStored()

function writeAll(entries: NotebookEntry[]) {
  cache = entries
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getNotebookEntries(): NotebookEntry[] {
  return cache
}

// Pinning always adds a new entry rather than toggling by href -- unlike a
// bookmark, a pin is a snapshot of the *current* result, and the same tool
// pinned again later (with a different input) is a distinct entry, not a
// dedupe target.
export function pinToNotebook(entry: Omit<NotebookEntry, 'id' | 'pinnedAt'>) {
  const id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Date.now())
  writeAll([{ ...entry, id, pinnedAt: Date.now() }, ...cache])
}

export function removeFromNotebook(id: string) {
  writeAll(cache.filter((entry) => entry.id !== id))
}

export function clearNotebook() {
  writeAll([])
}

export function subscribeToNotebook(callback: () => void): () => void {
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

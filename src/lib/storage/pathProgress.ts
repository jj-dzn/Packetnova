export type PathProgress = Record<string, string[]>

const STORAGE_KEY = 'packetnova:path-progress'
const CHANGE_EVENT = 'packetnova:path-progress-changed'

function parseStored(): PathProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

// Cached in memory so getPathProgress() returns a stable reference between
// writes -- useSyncExternalStore compares snapshots with Object.is, and a
// fresh object on every call would look like a change on every render.
let cache: PathProgress = parseStored()

function writeAll(next: PathProgress) {
  cache = next
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getPathProgress(): PathProgress {
  return cache
}

export function getCompletedSteps(pathSlug: string): string[] {
  return cache[pathSlug] ?? []
}

export function isStepComplete(pathSlug: string, stepKey: string): boolean {
  return (cache[pathSlug] ?? []).includes(stepKey)
}

export function toggleStepComplete(pathSlug: string, stepKey: string) {
  const current = cache[pathSlug] ?? []
  const next = current.includes(stepKey)
    ? current.filter((key) => key !== stepKey)
    : [...current, stepKey]
  writeAll({ ...cache, [pathSlug]: next })
}

export function subscribeToPathProgress(callback: () => void): () => void {
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

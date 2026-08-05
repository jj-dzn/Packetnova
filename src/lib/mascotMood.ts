import type { MascotMood } from '../components/ui/Mascot'

const CHANGE_EVENT = 'packetnova:mascot-mood-changed'
const REACTION_MS = 2500

let cache: MascotMood = 'idle'
let resetTimer: ReturnType<typeof setTimeout> | null = null

function setMood(mood: MascotMood) {
  cache = mood
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function getMascotMood(): MascotMood {
  return cache
}

// A reaction is a momentary reply to whatever a visitor just did (got a
// valid result, hit a validation error) -- not a persistent state, so it
// fades back to idle on its own rather than leaving the sitewide mascot
// stuck showing "fast" from a calculation someone ran an hour ago. Pure
// in-memory: no localStorage, since there's nothing here worth persisting
// across a reload -- unlike bookmarks/recently-viewed/path-progress, which
// use the same cache+dispatchEvent+useSyncExternalStore shape but do
// persist.
export function reportMascotMood(mood: MascotMood) {
  if (resetTimer) clearTimeout(resetTimer)
  setMood(mood)
  if (mood !== 'idle') {
    resetTimer = setTimeout(() => setMood('idle'), REACTION_MS)
  }
}

export function subscribeToMascotMood(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

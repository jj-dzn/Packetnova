const OPEN_EVENT = 'packetnova:open-command-palette'

// Lets the Nav's trigger button open the palette without prop-drilling
// state through PageShell -- same lightweight window-event pattern the
// bookmarks/recently-viewed stores use for cross-component sync.
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function subscribeToOpenCommandPalette(callback: () => void): () => void {
  window.addEventListener(OPEN_EVENT, callback)
  return () => window.removeEventListener(OPEN_EVENT, callback)
}

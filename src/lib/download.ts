// Browser-only file download for generated text content (device configs,
// exported data) -- there's no server to serve a real file from, so this
// builds a throwaway object URL, clicks a detached anchor at it, and
// revokes the URL right after. Not a calculation, so it lives outside
// lib/calculations alongside the other flat lib/ utilities.
export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

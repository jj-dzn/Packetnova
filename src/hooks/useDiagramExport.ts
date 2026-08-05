import { useCallback, useRef, useState } from 'react'
import { toPng, toSvg } from 'html-to-image'

export type DiagramExportFormat = 'png' | 'svg'

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'packetnova-diagram'
  )
}

// Every diagram/visualizer on the site is plain styled HTML, not SVG, so
// exporting "a picture of what's on screen" means rasterizing the live DOM
// rather than serializing vector paths that don't exist -- html-to-image
// does that (via an SVG foreignObject snapshot under the hood), giving both
// a PNG and an SVG file from the same DOM node with no server involved.
export function useDiagramExport<T extends HTMLElement>(filenameBase: string) {
  const ref = useRef<T>(null)
  const [pending, setPending] = useState(false)

  const exportAs = useCallback(
    async (format: DiagramExportFormat) => {
      const node = ref.current
      if (!node || pending) return
      setPending(true)
      try {
        const backgroundColor =
          getComputedStyle(document.documentElement).getPropertyValue('--pn-surface').trim() ||
          '#ffffff'
        const dataUrl =
          format === 'png'
            ? await toPng(node, { backgroundColor, pixelRatio: 2 })
            : await toSvg(node, { backgroundColor })
        triggerDownload(dataUrl, `${slugify(filenameBase)}.${format}`)
      } catch {
        // Nothing here pulls from another origin, so failure should be
        // rare -- if it happens anyway, there's nothing to recover into
        // beyond leaving the button clickable for another attempt.
      } finally {
        setPending(false)
      }
    },
    [filenameBase, pending],
  )

  return { ref, exportAs, pending }
}

import type { DiagramExportFormat } from '../../hooks/useDiagramExport'

interface ExportButtonProps {
  exportAs: (format: DiagramExportFormat) => void | Promise<void>
  pending: boolean
  className?: string
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3v10m0 0l-4-4m4 4l4-4M4 16h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const buttonClass =
  'rounded-md border border-border px-2 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-accent/40 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50'

// A downloadable snapshot of whatever DOM node the paired useDiagramExport
// hook's ref is attached to -- every diagram and visualizer on the site is
// plain styled HTML rather than SVG, so "export" always means rasterizing
// the live element, not serializing vector data that doesn't exist.
export function ExportButton({ exportAs, pending, className = '' }: ExportButtonProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-1 text-xs text-fg-subtle">
        <DownloadIcon />
        Export
      </span>
      <button
        type="button"
        onClick={() => exportAs('png')}
        disabled={pending}
        className={buttonClass}
      >
        PNG
      </button>
      <button
        type="button"
        onClick={() => exportAs('svg')}
        disabled={pending}
        className={buttonClass}
      >
        SVG
      </button>
    </div>
  )
}

export interface PacketLayer {
  label: string
  detail?: string
}

interface PacketStackInspectorProps {
  /** Outermost layer first, innermost (the actual payload) last. */
  layers: PacketLayer[]
  caption?: string
}

// The "synced header inspector" every journey stage can drop in next to
// its main content: a nested-box view of exactly what's wrapped around
// the packet right at this point in the story, growing and shrinking as
// the journey encapsulates or strips layers. Each journey passes its own
// layers for the current stage, so this re-renders in sync with the step
// player automatically -- no separate state to keep aligned.
export function PacketStackInspector({ layers, caption }: PacketStackInspectorProps) {
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <p className="mb-3 text-xs font-medium text-fg-muted">{caption ?? 'The packet right now'}</p>
      <div className="flex flex-col gap-1.5">
        {layers.map((layer, index) => {
          const isInnermost = index === layers.length - 1
          return (
            <div
              key={`${layer.label}-${index}`}
              style={{ marginLeft: `${index * 14}px`, marginRight: `${index * 14}px` }}
              className={`rounded-md border px-3 py-2 font-mono text-xs transition-all ${
                isInnermost
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-surface text-fg-muted'
              }`}
            >
              <span className={isInnermost ? 'font-medium' : 'font-medium text-fg'}>
                {layer.label}
              </span>
              {layer.detail && <span className="ml-2 text-fg-subtle">{layer.detail}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Suspense fallback for lazy-loaded route components. Shaped to roughly
// match ToolPageLayout/VisualizerPageLayout/ReferencePageLayout's actual
// structure (badge, heading, description, content box) rather than a
// generic spinner, specifically to minimize the layout shift between this
// placeholder and the real content it gets swapped for -- a poorly-matched
// fallback height shows up as a real (if small) CLS hit in Lighthouse.
//
// Two stacked boxes, not one: ToolPageLayout (the most common of the three
// shared layouts across the ~70 lazy routes) renders an input panel and a
// result panel that stack on mobile viewports, and a single box undershot
// that combined height enough to register its own measurable CLS. The
// single-content-box layouts (VisualizerPageLayout, ReferencePageLayout)
// overshoot this a bit instead, which is the safer direction to be wrong in.
export function RouteLoadingFallback() {
  return (
    <div className="animate-pulse py-12" aria-hidden="true">
      <div className="mb-8">
        <div className="h-5 w-20 rounded-full bg-surface" />
        <div className="mt-3 h-7 w-64 rounded bg-surface" />
        <div className="mt-2 h-4 w-full max-w-2xl rounded bg-surface" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-96 flex-1 rounded-lg border border-border bg-surface" />
        <div className="h-96 flex-1 rounded-lg border border-border bg-surface" />
      </div>
    </div>
  )
}

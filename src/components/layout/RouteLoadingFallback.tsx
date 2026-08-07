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
//
// The two extra blocks below account for content most (not all) tool
// pages also carry: a PathContextBanner above the grid on any page that's
// a step in a Guided Path, and a ToolEducation "Learn more" accordion
// below it -- a majority of tools have this now, and undershooting its
// real height was the single biggest remaining source of measured CLS
// (caught via Lighthouse on the CIDR calculator specifically, which has
// both). Same "overshoot is safer" reasoning as the panel heights above:
// a page with neither just shows a slightly taller fallback for a moment,
// vs. every page that has one or both getting a real, measurable shift.
export function RouteLoadingFallback() {
  return (
    <div className="animate-pulse py-12" aria-hidden="true">
      <div className="mb-6 h-11 w-full rounded-md bg-surface/60" />
      <div className="mb-8">
        <div className="h-5 w-20 rounded-full bg-surface" />
        <div className="mt-3 h-7 w-64 rounded bg-surface" />
        <div className="mt-2 h-4 w-full max-w-2xl rounded bg-surface" />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-96 flex-1 rounded-lg border border-border bg-surface" />
        <div className="h-96 flex-1 rounded-lg border border-border bg-surface" />
      </div>
      <div className="mt-10 border-t border-border pt-8">
        <div className="h-6 w-32 rounded bg-surface" />
        <div className="mt-4 flex flex-col gap-2">
          <div className="h-11 w-full rounded-md border border-border bg-surface/60" />
          <div className="h-11 w-full rounded-md border border-border bg-surface/60" />
          <div className="h-11 w-full rounded-md border border-border bg-surface/60" />
        </div>
      </div>
    </div>
  )
}

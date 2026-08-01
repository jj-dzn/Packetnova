# Shared diagram primitives

Small, stateless rendering primitives for network diagrams, used by both
tools (`src/features/tools/...`) and visualizers (`src/features/visualizers/...`).
They draw; callers decide what the drawing means.

## Why these exist

Before this folder, `OspfSpfVisualizer` and `StpOverview` had each hand-rolled
an almost identical inline `<svg>` for drawing circles-and-lines topologies,
and `NatFlowVisualizer` had two different ad hoc representations of a NAT
mapping table (a plain text string for static NAT, a bespoke `<table>` for
PAT). Same visual grammar, written three separate times. These primitives
are that grammar, written once.

## Design principle: primitives draw, callers decide state

A shared "tone" enum (e.g. `'active' | 'visited' | 'blocked'`) can't cleanly
cover every diagram that wants one -- OSPF SPF has independent
visited/active booleans, STP overview has a simple root/non-root binary, and
forcing both through one enum is either too narrow or too generic to be
useful. So these primitives don't model state at all: they accept concrete
CSS custom-property values (`fill`, `stroke`, `dashed`, ...) computed by the
caller from its own semantics, and just draw them. Reuse the site's existing
tokens (`var(--color-accent)`, `var(--color-accent-alt)`, `var(--color-border)`,
`var(--color-surface)`, `var(--color-fg-muted)`, ...) so every diagram stays
on the same two-decorative-hue palette described in `docs/DESIGN_SYSTEM.md`.

## What's here

- **`TopologyCanvas`** -- freeform node-and-edge SVG diagram. Pass positioned
  `TopologyNode[]` / `TopologyEdge[]` (ids, coordinates, label, optional
  `fill`/`stroke`/`strokeWidth`/`dashed`/edge `label`). Used by OSPF SPF's
  step-through walkthrough (algorithmic layout via `circularLayout`) and STP
  overview's port-role example (fixed hand-placed positions) -- reach for it
  any time a diagram is "boxes/circles connected by lines," whether the
  layout is computed or fixed.
- **`DeviceIcon`** / `DeviceIconKind` -- simple geometric device glyphs
  (`router`: circle with four radiating spokes; `switch`: rounded rect with
  port ticks; `firewall`: shield outline) matching the logo's node-and-
  connection visual language. Deliberately not literal hardware art --
  `docs/DESIGN_SYSTEM.md` rules out router/cloud clichés. Pass `icon` on a
  `TopologyNode` to draw one instead of a plain circle.
- **`NatTableDiagram`** -- private-address/public-address mapping table.
  `dense` + `showHeader={false}` for a single highlighted row embedded in a
  small flow-diagram box (NAT flow's static-mode NAT router box); the
  defaults suit a full-width standalone table with many rows (PAT/NAT
  overload).

## Related, but not in this folder

- **`MiddleboxFlowContent`** (`features/visualizers/MiddleboxFlowVisualizer.tsx`)
  -- the "left box / middle box / right box" animated-pill flow used by NAT
  and VPN packet-flow visualizers. Its `middleValue` accepts any `ReactNode`,
  so it's a natural place to drop in a `NatTableDiagram` (as NAT flow does)
  rather than a plain status string.
- **`SequenceDiagramContent`** (`features/visualizers/SequenceDiagramVisualizer.tsx`)
  -- two-participant message sequencing, for flows with no third device
  rewriting anything in the middle.

Reach for `TopologyCanvas` when the diagram is a topology (nodes connected by
links); `MiddleboxFlowContent` or `SequenceDiagramContent` when it's a
request/response flow between parties over time; `NatTableDiagram` when it's
specifically an address-mapping table.

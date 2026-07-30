# Roadmap

Build incrementally. Each milestone should be fully working, responsive, dark-mode-correct, and polished before starting the next — resist scaffolding everything at once.

## Milestone 1 — Foundation

- [ ] Vite + React + TypeScript + Tailwind scaffold
- [ ] Repo folder structure in place (see ARCHITECTURE.md)
- [ ] ESLint + Prettier + strict TypeScript config
- [ ] Deploy pipeline to GitHub Pages (custom domain packetnova.ca) working end to end with a placeholder page — prove hosting works before building features

## Milestone 2 — Design system

- [ ] Tailwind theme config (colors, type scale, spacing)
- [ ] Dark mode implemented (class-based, persisted via localStorage)
- [ ] Core components: Button, Card, Badge, PageShell
- [ ] Logo finalized as SVG + favicon

## Milestone 3 — Navigation & shell

- [ ] Nav (desktop + mobile menu)
- [ ] Footer
- [ ] Routing set up (decide hash vs history mode — see TECH_DECISIONS.md)
- [ ] 404 page

## Milestone 4 — Homepage

- [ ] Hero section
- [ ] Popular tools section
- [ ] Latest articles section (can use placeholder content until blog exists)
- [ ] Featured visualizers section
- [ ] Why PacketNova section
- [ ] Newsletter placeholder
- [ ] Footer wired in

## Milestone 5 — Tool framework

- [ ] Shared tool page layout (title, description, input form, result panel, category badge)
- [ ] `lib/validation/ip.ts` — shared IP/CIDR parsing, unit tested
- [ ] Tool listing/category pages

## Milestone 6 — First five tools

- [ ] CIDR calculator
- [ ] Subnet calculator
- [ ] IP range calculator
- [ ] Broadcast calculator
- [ ] Network address calculator
- [ ] Unit tests for all five against known-correct vectors

## Milestone 7 — Search

- [ ] Choose search library (see TECH_DECISIONS.md)
- [ ] Build search index at build time (tools + any content that exists so far)
- [ ] Search UI (nav bar + dedicated page)

## Milestone 8 — Remaining tool categories

- [ ] VPN tools
- [ ] Routing tools/simulators
- [ ] Switching tools
- [ ] Protocol explorers
- [ ] Security tools
- [ ] Utilities

## Milestone 9 — First visualizer

- [ ] TCP three-way handshake (recommended first — well understood, visually clean)
- [ ] Accessibility pass: keyboard controls + reduced-motion fallback
- [ ] Use as the template for remaining visualizers

## Milestone 10 — Remaining visualizers

- [ ] Roll out remaining 9 visualizers using the milestone 9 template

## Milestone 11 — Blog

- [ ] Markdown pipeline for posts (may reuse Learn's pipeline)
- [ ] Post listing with category/tag filters
- [ ] First 3 posts
- [ ] Remaining posts

## Milestone 12 — Polish pass

- [ ] Lighthouse audit (performance, accessibility, SEO) ≥ 95 across the board
- [ ] SEO: meta tags, sitemap, structured data where relevant
- [ ] Asset optimization, lazy loading
- [ ] Cross-browser/mobile QA

## Milestone 13 — AI-ready stub (optional, low priority)

- [ ] `ai/provider.ts` interface + `NullProvider` in place
- [ ] Confirm no feature code references AI directly

## Milestone 14 — Learn section (future, optional — not in current scope)

Deprioritized. See `CONTENT_PLAN.md` → "Learn section" for reasoning. Only revisit if a specific tool/visualizer would clearly benefit from a companion explainer page, and keep it small (3-4 pages, not the original 14-topic list).

## Milestone 15 — Bonus/fun ideas (optional, post-launch)

- [ ] Review `CONTENT_PLAN.md` → "Bonus / fun ideas" section
- [ ] Pick at most one or two to build (e.g. the traffic-starfield visualizer as a homepage differentiator)
- [ ] Keep these clearly separated from core nav/tools so they read as polish, not scope creep

Do not start a milestone until the previous one is genuinely done — not "mostly working."

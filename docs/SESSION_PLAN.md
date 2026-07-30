# Session plan

Suggested breakdown for building PacketNova in VS Code with Claude Code, spread across sessions rather than one continuous run. Each session ends at a natural review point — check the listed things before starting the next session.

**Before session 1:** upload/unzip the full `packetnova-docs` folder into the project repo, then ask Claude Code to read `README.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, and `ROADMAP.md` before doing anything else. Don't skip this — it's the shared context for every session after.

---

## Session 1 — Foundation

**Roadmap milestones:** 1, 2, 3

- Vite + React + TypeScript + Tailwind scaffold
- Folder structure per ARCHITECTURE.md
- GitHub Pages deploy pipeline working end-to-end (prove hosting works early, before features)
- Sci-fi dark theme in Tailwind config (deep space background, glow accents — see DESIGN_SYSTEM.md)
- Dark mode persisted, Nav + Footer + routing + 404 page

**Review before moving on:** site loads locally, deploys successfully to packetnova.ca, theme looks right, nav/routing works.

---

## Session 2 — Homepage + tool framework

**Roadmap milestones:** 4, 5

- Homepage sections (hero, popular tools, visualizers, labs, footer) matching the mockup direction
- Shared tool page layout (title, description, input, result, category badge)
- `lib/validation/ip.ts` — shared IP/CIDR parser, unit tested

**Review before moving on:** homepage matches the agreed sci-fi direction, IP parser has passing tests against known-correct values.

---

## Session 3 — First five tools

**Roadmap milestone:** 6

- CIDR calculator, subnet calculator, IP range calculator, broadcast calculator, network address calculator
- Unit tests against known-correct vectors (RFC 4632, RFC 1918 examples)

**Review before moving on:** spend real time here — manually check each calculator's output against known-correct examples yourself, not just "does it render." This sets the correctness bar for every tool after it.

---

## Session 4 — Search + remaining tool rollout

**Roadmap milestones:** 7, 8

- Pagefind search index + UI
- Remaining ~35 tools across VPN, routing, switching, protocols, security, utilities

**Review before moving on:** search returns correct results; spot-check a handful of tools across different categories, don't approve all of them in one pass.

---

## Session 5 — First visualizer

**Roadmap milestone:** 9

- TCP three-way handshake visualizer
- Keyboard controls + `prefers-reduced-motion` fallback

**Review before moving on:** this becomes the template for every other visualizer — worth getting genuinely right (interaction feel, accessibility, animation quality) before repeating the pattern 9 more times.

---

## Session 6 — Remaining visualizers

**Roadmap milestone:** 10

- Roll out the other 9 visualizers using the Session 5 template

**Review before moving on:** spot-check 2–3, not all 9 in one sitting.

---

## Session 7 — Polish pass

**Roadmap milestones:** 12, 13

- Lighthouse audit (performance, accessibility, SEO) targeting ≥ 95
- Meta tags, sitemap, asset optimization, lazy loading
- Cross-browser/mobile QA
- AI abstraction stub (`ai/provider.ts` + `NullProvider`) if not already in place

**Review before moving on:** this is effectively launch-ready at this point.

---

## Session 8 — Optional extras

**Roadmap milestones:** 14 (Learn — only if still wanted), 15 (Labs)

- Traffic starfield, ping pet, retro terminal easter egg
- Learn section only if you decide you want it later — see CONTENT_PLAN.md reasoning for why it's deprioritized

---

## General tips across all sessions

- Tell Claude Code explicitly which milestone to work on each session — don't let it freelance ahead into later milestones even if it offers to.
- Commit to git after each session before starting the next, so you have clean rollback points.
- Sessions 3 and 5 are the two worth budgeting real personal attention for — they set the pattern everything else copies (correctness for tools, interaction quality for visualizers).

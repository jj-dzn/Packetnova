# PacketNova

Networking tools built for engineers.

PacketNova is a free, client-side networking toolkit: calculators, protocol explorers, interactive visualizers, a learning section, and a blog — all static, all usable without an account or backend.

**Tagline:** "Networking tools built for engineers."
**Alt tagline:** "Visualize. Calculate. Troubleshoot."
**Domain:** packetnova.ca (GitHub Pages)

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- GitHub Pages (static hosting, custom domain)
- No backend, no database, no paid services

## Project status

Pre-build. This repo currently contains planning docs only (`/docs`). See `docs/ROADMAP.md` for the build order.

## Getting started (once code exists)

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to /dist
npm run preview   # preview production build
```

## Repo structure

```
docs/                  → planning docs (this is what you have now)
src/
  components/           → shared UI (Nav, Footer, Button, Card, etc.)
  features/
    tools/              → calculators, grouped by category
    visualizers/        → interactive protocol visualizers
    learn/              → documentation/learning pages
    blog/                → blog listing + post rendering
  lib/                  → pure calculation logic (no React, unit-testable)
  hooks/                → shared React hooks
  ai/                    → AI abstraction layer (stubbed, not active)
  content/               → markdown source for blog + learn
public/
```

## Core principles

1. **Useful without AI.** AI is a future enhancement, never the product.
2. **Correctness first.** Calculators are the trust foundation of this site — every one needs a tested, pure function behind it.
3. **No backend.** Everything runs in the browser. Static hosting only.
4. **Consistent design system.** One shared Nav/Footer/Layout across every page.
5. **Build incrementally.** Ship one polished thing before starting the next.
6. **Tools and visualizers are the product.** The Learn/documentation section is deprioritized — plenty of good networking education already exists elsewhere. PacketNova's edge is being the best free _toolkit_, not another explainer site. See `docs/CONTENT_PLAN.md` for details.

## Docs index

- `docs/ARCHITECTURE.md` — folder structure, data flow, AI abstraction layer
- `docs/DESIGN_SYSTEM.md` — colors, type, spacing, component rules
- `docs/CONTENT_PLAN.md` — full tool/visualizer/blog/learn inventory
- `docs/ROADMAP.md` — milestone-by-milestone build order
- `docs/TECH_DECISIONS.md` — routing, search, markdown pipeline, testing choices

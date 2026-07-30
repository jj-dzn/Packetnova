# Tech decisions

Open questions worth deciding before (or right at the start of) building, so you're not refactoring mid-project.

## 1. Routing mode on GitHub Pages

GitHub Pages has no server-side rewrites.

- **Option A — Hash routing** (`/#/tools/subnet-calculator`): zero config, works immediately, slightly uglier URLs, worse for SEO on sub-pages.
- **Option B — History mode + 404.html redirect trick**: cleaner URLs, better SEO, needs a small redirect script copied into `404.html` that forwards to `index.html` with the path preserved.

**Recommendation:** Option B if SEO on individual tool/blog/learn pages matters (it likely does, since "be one of the best free networking resources on the web" implies organic search traffic). Slightly more setup, worth it once.

## 2. Markdown content pipeline (blog + learn)

- **Option A — MDX** via `@mdx-js/rollup`: lets you embed interactive React components directly in posts (e.g. drop a mini visualizer into a blog post about TCP retransmissions).
- **Option B — Plain markdown** via `remark`/`rehype` at build time, rendered as static HTML: simpler, faster, no component embedding.

**Recommendation:** Start with Option B for speed; revisit MDX later if you want embedded interactive examples in posts.

## 3. Client-side search

- **Pagefind** — purpose-built for static sites, indexes at build time, very fast, minimal setup.
- **Fuse.js** — lightweight fuzzy search, you build/maintain the index yourself in JS.
- **Lunr.js** — similar to Fuse, older, less actively maintained.

**Recommendation:** Pagefind — least custom code to maintain, designed exactly for this use case (static site, build-time index).

## 4. Testing

- Unit tests for every function in `lib/calculations/` — use Vitest (pairs naturally with Vite).
- Known-correct test vectors: RFC 4632 (CIDR), RFC 1918 (private ranges), standard subnet examples. Write these before or alongside each calculator, not after.
- No need for heavy e2e testing initially; component-level tests for shared UI (Nav, Card, PageShell) are enough at this stage.

## 5. Analytics

No backend means no self-hosted analytics (Plausible/Umami need a server). Options:

- Skip analytics entirely initially.
- Use GitHub's built-in repo traffic insights (limited, but free and zero setup).
- Revisit a privacy-friendly hosted option later if traffic justifies it.

**Recommendation:** Skip for now; revisit post-launch.

## 6. Default theme

Dark-first (Wireshark/dev-tool energy) vs light-first (Cisco/enterprise energy) as the default — see the homepage mockup shared earlier for a dark-first reference point. Pick before building the Tailwind theme config, since it affects the whole color system.

## Decisions log

| Date       | Decision                                                                            | Rationale                                                                                                                                                                                                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-30 | Dark-first default theme. Light mode supported via a toggle, not system preference. | DESIGN_SYSTEM.md's whole visual direction (deep space background, glow accents) is written as the dark experience; light mode is explicitly the secondary/available mode, not co-equal. Defaulting to dark regardless of OS preference keeps the first impression consistent with that direction. |

Fill this in as choices are actually made, so future-you remembers why.

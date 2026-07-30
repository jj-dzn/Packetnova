# Design system

## Direction

**Sci-fi / space theme, leaning hard into the "nova" name.** Not generic dev-tool minimalism — PacketNova should feel like a control panel in a spacecraft, or a signal being tracked across deep space. Dark-first by default (light mode still needs to work, but dark is the "home" experience). Think: deep space background, glowing accent colors, subtle starfield texture, particles/nodes connected by light — this is also literally what network topology looks like, so the metaphor is free.

Still professional and usable — this is a sci-fi _aesthetic_ layered onto a genuinely clean, fast, accessible tool site, not a gimmick that gets in the way of using a calculator. The bar: it should feel great to open, and disappear once you're focused on a tool.

**Visual language:**

- Deep space background (near-black, slight blue/purple undertone) rather than flat gray-black.
- Accent glow on interactive elements (buttons, active nav, focus states) — soft blue/purple/teal glow, not neon overkill.
- Subtle animated starfield or particle field in the hero/background — CSS/canvas, very low opacity, never distracting from content.
- Node-and-connection motifs (dots + lines) show up naturally in the logo, dividers, and loading states — this is genuinely what packet routing looks like, so it reinforces the product too.
- Monospace for anything "data" (IPs, hex, headers) reads like a HUD/terminal readout — leans into the feel further.
- The "Traffic starfield" and "Retro terminal" lab experiments (see CONTENT_PLAN.md) are natural extensions of this theme rather than random add-ons — worth building those earlier than originally planned since they reinforce the core visual identity.

**Restraint boundary:** glow/particles/motion are for atmosphere and accents — never on body text, never inside a calculator's input/output area, never something that reduces contrast or slows down actually reading a result. A subnet calculator result needs to be instantly legible; the spaceship feeling lives in the chrome around it, not in the data itself.

**Decision needed before building:** confirm dark-first as default (this direction assumes it — light mode as an available toggle, not the default identity).

## Color palette

Keep this deliberately small even with the sci-fi direction — glow comes from how colors are used (soft shadow/blur on accents), not from adding more hues.

| Role                        | Use                                                                                                                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background (base)           | deep space near-black, slight blue/purple undertone — not flat gray                                                                                                                |
| Background (surface)        | slightly lifted panel color, still dark, for cards                                                                                                                                 |
| Border                      | 1px hairlines, low-opacity white/blue — think "panel seam," not heavy lines                                                                                                        |
| Text primary                | near-white, high contrast                                                                                                                                                          |
| Text secondary              | muted blue-gray                                                                                                                                                                    |
| Text muted                  | placeholders, captions                                                                                                                                                             |
| Accent                      | one primary glow color (blue or purple) — links, primary buttons, active nav, focus rings, starfield particles                                                                     |
| Secondary accent (optional) | teal or magenta, used sparingly for a second data series or highlight — not a full second UI color                                                                                 |
| Success / Warning / Danger  | tool validation states only (e.g. invalid CIDR input) — keep these semantically standard (green/amber/red) even inside the space theme, so errors are still instantly recognizable |

Avoid the trap of "everything glows" — glow is a highlight technique, most of the UI should be quiet dark panels so the glowing elements (buttons, active states, the starfield) actually stand out.

## Typography

- One sans-serif for UI (headings + body).
- One monospace for anything representing raw data: IP addresses, hex, binary, header fields, code blocks, CLI output. This distinction matters a lot for a networking site — numbers and addresses should visually read as "data," not as prose.
- Scale: keep to 5–6 sizes total (e.g. 12/13/14/16/20/28px). Avoid ad hoc sizing per component.

## Spacing & layout

- Consistent page width cap (e.g. max-width 1200px) with generous side padding on mobile.
- Cards: consistent radius and border treatment across every tool card, blog card, and visualizer card — one card component reused everywhere.
- Whitespace over borders where possible; use borders sparingly (hairline only).

## Components to build once, reuse everywhere

- `PageShell` (Nav + Footer + content slot) — every page uses this, no exceptions.
- `Card` — used for tool tiles, blog previews, visualizer previews.
- `Button` (primary / secondary variants only — no third variant).
- `Badge` — category tags (IP, VPN, Security, etc.)
- `CodeBlock` / `MonoValue` — for displaying calculated results, hex, binary.
- `SearchBar` — shared across Nav and dedicated Search page.
- `Breadcrumb` — for tool/learn/blog nested pages.

## Motion

Subtle only: fade/slide-in on scroll for section reveals, smooth transitions on tool result updates. No decorative animation. Visualizers (TCP handshake, OSPF SPF, etc.) are the one place where richer animation is the actual point of the page — keep everything else restrained so those stand out.

## Accessibility requirements

- All interactive visualizers need keyboard controls (not just mouse/touch) and a `prefers-reduced-motion` fallback that shows a static end-state or step-by-step instead of continuous animation.
- Color must never be the only signal (e.g. valid/invalid input state also needs an icon or text, not just a red border).
- Target Lighthouse accessibility ≥ 95 alongside performance ≥ 95.

## Logo

Simple SVG combining nodes + connecting paths, geometric, no router/cloud clichés. See in-chat mockup for a starting concept (three connected nodes forming a path). Finalize as a standalone `logo.svg` + favicon before building Nav.

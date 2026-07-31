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

---

# Tool & Visualizer Excellence Roadmap

A second track, separate from the core build above. Where Milestones 1-15 are about *having* every tool and visualizer, this track is about making each one best-in-class -- grounded in a full read of the actual implementation, not generic polish advice. Full findings (every strength/weakness/wow-feature call, per tool) live in `docs/TOOL_VISUALIZER_AUDIT.md`; read that first, this is where those findings become ordered work.

Labeled `T1`-`T10` (not renumbered into the core 1-15 sequence) so it can be referenced independently. Sequential and dependency-ordered, same rule as the rest of this document: don't start `T4` before `T3` is genuinely done.

## Milestone T1 — Input & Output UX Polish

**Goal:** Close the handful of gaps that are universal across nearly every tool, before building anything new on top of them.

**Features included:**
- [ ] Copy-to-clipboard on every `ResultRow` and read-only output textarea -- confirmed missing across all 48 tools
- [ ] Search/filter added to `DataTable`, fixing 7 reference tools at once (UDP header, ICMP, DNS record, HTTP status, TLS version, DHCP options, Administrative Distance)
- [ ] Fix `PasswordGenerator`'s redundant double-computation (compute once, store in state, regenerate only on explicit action)
- [ ] Group HTTP status codes by class (1xx-5xx) with a visible class badge; confirm/enforce Administrative Distance sorted ascending

**Estimated effort:** Medium -- touches many files, but each change is small and mechanical.

**Dependencies:** None. Purely additive to existing shared components (`ResultRow`, `DataTable`).

**Expected user impact:** Universal -- every one of the 48 tools benefits from at least one item here, and the `DataTable` fix alone unblocks the least interactive category on the site (Protocols reference tables).

**Affects:** All 48 tools (copy buttons); UDP/ICMP/DNS/HTTP/TLS/DHCP reference tools + Administrative Distance (search); Password generator.

## Milestone T2 — Interactive Explanations

**Goal:** Teach while calculating -- contextual explanation snippets keyed to a tool's *actual computed result*, not generic prose. (Grounded lookup-table snippets, not free-generated text, so nothing can explain an edge case incorrectly.)

**Features included:**
- [ ] Classification-aware explanations on CIDR/Network Address calculators (e.g. "Private use (RFC 1918) -- not routable on the public internet without NAT")
- [ ] Per-row efficiency callouts in VLSM mode ("50 requested, 62 available, 12 to spare")
- [ ] MSS-clamping explanation on MSS calculator; wildcard-vs-subnet-mask context on Wildcard Mask calculator
- [ ] "Did you know" asides: limited broadcast (255.255.255.255) vs. directed broadcast; OSPF reference-bandwidth gotcha on modern high-bandwidth links

**Estimated effort:** Medium.

**Dependencies:** None required, but shares files with T1 -- sequencing after it avoids touching the same components twice.

**Expected user impact:** High specifically for visitors trying to learn, not just get an answer -- this is the most direct lever on "educational value" of anything in this roadmap.

**Affects:** CIDR, Subnet (VLSM), Network Address, Broadcast, Wildcard Mask calculators; MSS, MTU, Bandwidth Estimator; Metric comparison tool; STP overview.

## Milestone T3 — Visual Diagram System

**Goal:** Build one reusable diagram pattern and apply it everywhere the audit found a "this should be a picture, not a table" gap -- the single highest-leverage milestone for both delight and education.

**Features included:**
- [ ] Byte-level header diagram component, reused across TCP/UDP/IP header explorers (labeled, proportionally-sized byte boxes instead of a plain reference table)
- [ ] Bit-level field diagram for the 802.1Q tag (PCP/DEI/VLAN ID as colored, unequal-width bit segments), extending the `BinaryBreakdown` pattern already built for IP tools
- [ ] Nested-box redesign of the Packet Encapsulation visualizer, so layers visually wrap the previous layer instead of appending as a flat row of chips
- [ ] Side-by-side OSI vs. TCP/IP stack view with connecting lines -- closes the single clearest "tool doesn't do what its description says" finding in the audit
- [ ] Address-space bar visualization for CIDR, Network Address, and IP Range calculators

**Estimated effort:** Large.

**Dependencies:** None technically, but sequenced after T1/T2 since it's the biggest lift and benefits from the same components already being touched.

**Expected user impact:** Very high -- this is where "wow" and "teaches while it calculates" concentrate most across the whole audit.

**Affects:** TCP/UDP/IP header explorers, 802.1Q tag explorer, Packet Encapsulation visualizer, OSI Model Explorer, TCP/IP Stack Explorer, CIDR/Network Address/IP Range calculators.

## Milestone T4 — Professional Networking Features

**Goal:** Close the specific "what would a working network engineer expect that's missing" gaps identified per tool.

**Features included:**
- [ ] EUI-64 / SLAAC address generator on the IPv6 calculator (prefix + MAC -> interface ID) -- currently has no home anywhere on the site
- [ ] Certificate *chain* parsing on Certificate viewer (multiple PEM blocks, leaf -> intermediate -> root), not single-cert only
- [ ] PAT/NAT-overload mode on the NAT flow simulator -- the many-to-one scenario is what "NAT" means for most real networks, and the current example only shows one-to-one
- [ ] Tunnel-mode vs. transport-mode toggle on the VPN packet flow visualizer
- [ ] Capture-group breakdown on Regex tester (per-group match, not just the highlighted full match)
- [ ] YAML <-> JSON conversion mode on the YAML formatter

**Estimated effort:** Large.

**Dependencies:** None.

**Expected user impact:** High specifically against "would a professional trust and reach for this" -- these are the gaps most likely to make an experienced engineer bounce off a tool.

**Affects:** IPv6 calculator, Certificate viewer, NAT flow visualizer, VPN packet flow visualizer, Regex tester, YAML formatter.

## Milestone T5 — Advanced Simulation Mode

**Goal:** Let visitors bring their own scenario into visualizers that are currently fixed-example only by deliberate design (see `TOOL_VISUALIZER_AUDIT.md` cross-cutting finding #3) -- starting with the strongest candidate.

**Features included:**
- [ ] Full topology editing on the OSPF SPF visualizer: add/remove routers, edit link costs, re-run Dijkstra live. The best-executed visualizer on the site and the one whose SVG/algorithm logic is already closest to supporting this.
- [ ] Packet-loss/retransmission toggle scenario on the TCP handshake visualizer (what happens when a SYN or SYN-ACK is lost) -- the practical reason engineers actually care about this handshake in production debugging
- [ ] TLS 1.2 vs. 1.3 side-by-side toggle on the TLS handshake visualizer, with a live round-trip counter making the efficiency difference felt, not just described
- [ ] "Randomize topology" as an interim quick win on OSPF SPF before full editing ships

**Estimated effort:** Large.

**Dependencies:** T3 (diagram system) -- topology editing benefits from shared diagram/interaction primitives built there.

**Expected user impact:** Very high -- directly targets the single biggest documented ceiling on the entire Visualizers category.

**Affects:** OSPF SPF visualizer, TCP handshake visualizer, TLS handshake visualizer.

## Milestone T6 — Delight & Micro-Interactions

**Goal:** Ship the specific per-tool "wow feature" animations identified in the audit that are small, self-contained, and don't require new calculation logic -- extending the sitewide micro-interactions pass (card tilt, focus glow, page transitions) into tool-specific moments.

**Features included:**
- [ ] Animated packet-fragment "peeling off" on the Packet Fragmentation calculator
- [ ] Avalanche-effect animation on Hash generator (single-character edit -> completely different hash, animated)
- [ ] Live entropy bar on Password generator, filling as length/character-class options change before generating
- [ ] Animated packet-travel visual on the Latency calculator (distance -> visibly longer travel time)
- [ ] Binary bit-toggle sandbox on CIDR calculator and Base converter (click a bit, watch every dependent value recompute)

**Estimated effort:** Medium.

**Dependencies:** Reuses the existing sitewide motion vocabulary (timing/easing already established) rather than inventing new patterns.

**Expected user impact:** Medium-high for memorability specifically; lower direct utility impact than T1-T5, but this is where "genuinely enjoyable" and "share-with-a-friend" moments live.

**Affects:** Packet Fragmentation calculator, Hash generator, Password generator, Latency calculator, CIDR calculator, Base converter.

## Milestone T7 — Accessibility & Mobile Excellence

**Goal:** Extend the already-strong visualizer accessibility foundation (`useStepPlayer`'s keyboard nav + reduced-motion handling) to the tool category, which hasn't had the same systematic treatment.

**Features included:**
- [ ] Confirm T1's `DataTable` search/filter is fully keyboard-operable and screen-reader-announced
- [ ] Focus management audit across all 48 tool input forms
- [ ] Mobile ergonomics pass on the densest forms specifically (BGP path comparison's 11-field-per-candidate cards, STP's multi-row bridge editor, LPM/Route Lookup's route-table rows)
- [ ] Color contrast audit on Badge tones (danger/warning/success) in both light and dark themes

**Estimated effort:** Medium.

**Dependencies:** T1 -- `DataTable` search has to exist before it can be audited for keyboard operability.

**Expected user impact:** High for a meaningfully underserved segment of visitors, and foundational for trust regardless of audience.

**Affects:** BGP route visualizer, STP overview, LPM simulator, Route lookup simulator (dense forms); all `DataTable`-based reference tools; every tool using `Badge` for status.

## Milestone T8 — Educational Layer

**Goal:** Fill genuine content gaps the audit surfaced, not just polish what already exists.

**Features included:**
- [ ] New DHCP DORA (Discover/Offer/Request/Ack) sequence visualizer -- reuses `SequenceDiagramVisualizer` almost directly; DHCP currently has a reference table but no visualizer at all, unlike every other major protocol on the site
- [ ] TCP connection teardown (FIN/FIN-ACK/ACK) as an extension of the TCP handshake visualizer -- the state-machine story is incomplete without it
- [ ] "Example record" column on DNS record reference, plus an optional mini resolution-flow visualization (root -> TLD -> authoritative -> answer)
- [ ] Common-mistakes/real-world-scenario asides threaded through the MTU -> MSS -> Packet Fragmentation chain in VPN tools

**Estimated effort:** Large.

**Dependencies:** T2 (explanation infrastructure) and T3 (diagram system, for the new DHCP visualizer to reuse).

**Expected user impact:** High -- this is the most direct growth in raw educational surface area covered by the site.

**Affects:** New DHCP visualizer, TCP handshake visualizer, DNS record reference, MTU/MSS/Packet Fragmentation calculators.

## Milestone T9 — Expert Mode

**Goal:** For tools currently simplified for approachability, add an opt-in advanced layer without cluttering the default experience.

**Features included:**
- [ ] BGP route visualizer: collapse rarely-changed fields (router ID, neighbor IP, route age) behind a "show advanced attributes" toggle, on by default hidden
- [ ] TCP header explorer: full header builder (ports, seq/ack, window -- not just the flags byte) as an expert extension of the existing live calculator
- [ ] Multi-preset comparison table on the VPN Tunnel Overhead calculator (all tunnel types side by side, not one at a time)
- [ ] STP overview: compute and display root/designated/blocked ports on a small fixed topology, not just root bridge election -- closing the gap between the tool's already-written explanatory prose and what it actually calculates

**Estimated effort:** Medium.

**Dependencies:** T4 (professional features) -- expert mode is the natural extension of those additions.

**Expected user impact:** Medium-high specifically against the "professional trust" audit dimension, for visitors who've outgrown the default simplified view.

**Affects:** BGP route visualizer, TCP header explorer, VPN Tunnel Overhead calculator, STP overview.

## Milestone T10 — Exceptional Product Finish

**Goal:** Resolve the naming and cross-linking gaps that make the site read as 58 independent pages instead of one coherent product.

**Features included:**
- [ ] Resolve every naming collision flagged in the audit: rename "BGP route visualizer" (tool) to disambiguate from "BGP best path selection" (visualizer); rename "Routing decision simulator" (visualizer) to disambiguate from "Route lookup simulator" (tool); merge JWT Decoder and JWT Inspector into one tool with a raw/summary toggle
- [ ] Systematic cross-linking pass: MTU -> MSS -> Packet Fragmentation chain; TLS Version Explorer <-> TLS handshake visualizer; IP Header Explorer's Fragment Offset row -> Packet Fragmentation calculator; VPN Packet Flow visualizer -> VPN Tunnel Overhead calculator
- [ ] Consistent per-OSI-layer color language shared across OSI Model Explorer, TCP/IP Stack Explorer, and Packet Encapsulation visualizer (currently each uses its own, unrelated styling)

**Estimated effort:** Medium.

**Dependencies:** Comes last deliberately -- depends on the actual T1-T9 features existing before their cross-links have anything to point to.

**Expected user impact:** High for overall product cohesion, even though no single change here is individually dramatic -- this is the milestone that makes the rest of the roadmap feel like one product instead of a pile of independently-good pages.

**Affects:** BGP tool/visualizer pair, Routing decision/Route lookup pair, JWT Decoder/Inspector, the MTU/MSS/Fragmentation chain, TLS tools, the OSI/TCP-IP/Encapsulation trio.

---

## Final prioritization

### The 10 improvements that would most dramatically improve user experience

1. Copy-to-clipboard everywhere (T1) -- the single most universally-missing feature, affecting all 48 tools.
2. `DataTable` search/filter (T1) -- unblocks the least interactive category on the site (6 static Protocol reference tables) with one component fix.
3. Byte-level header diagrams for TCP/UDP/IP explorers (T3) -- replaces the driest, most table-heavy pages with something people can actually *see*.
4. OSI vs. TCP/IP side-by-side stack view (T3) -- fixes the clearest "doesn't do what it says" gap in the whole audit.
5. VLSM per-row efficiency callouts (T2) -- turns the Subnet calculator's most powerful mode into something self-explanatory.
6. Full topology editing on OSPF SPF (T5) -- the best visualizer on the site, currently capped at one fixed example.
7. PAT/NAT-overload mode on NAT flow simulator (T4) -- the NAT scenario most people actually picture, which the current tool doesn't show.
8. Nested-box encapsulation redesign (T3) -- makes "encapsulation" visually true to its own name.
9. Loud match/no-match state on Hash verifier (T1/T2 adjacent) -- the tool's entire job is a yes/no answer that currently reads as quiet table text.
10. Naming-collision fixes (T10) -- BGP tool vs. visualizer, Routing decision vs. Route lookup -- removes real, confirmed first-visit confusion.

### The 10 improvements that would make PacketNova noticeably better than competing networking sites

1. Full OSPF SPF topology editor (T5) -- most free tools don't offer live shortest-path simulation on an editable graph at all.
2. Route summarizer (already shipped) plus visualized merge-mapping (IP tools audit) -- route aggregation is rare among free subnet calculators generally.
3. "Explain this regex" plain-English breakdown (Utilities audit) -- a genuinely rare feature among free regex testers.
4. Certificate chain parsing, not single-cert (T4) -- most free cert viewers don't bother with chains.
5. EUI-64/SLAAC generator (T4) -- a commonly-needed IPv6 calculation with no home on most competing sites either.
6. TCP packet-loss/retransmission scenario toggle (T5) -- shows the practical, production-relevant version of the handshake, not just the textbook happy path.
7. Avalanche-effect hash visualization (T6) -- visceral, rare, and directly demonstrates *why* hashing works as an integrity check.
8. TLS 1.2 vs. 1.3 timed side-by-side comparison (T5) -- makes an efficiency claim felt instead of asserted.
9. VLSM mode itself (already shipped) combined with a live visual block-diagram allocation view (IP tools audit wow feature) -- most free subnet calculators only do equal splits.
10. DHCP DORA visualizer (T8) -- fills a protocol-coverage gap most competing sites also leave as text-only.

### The 10 improvements that are easiest to implement but provide the highest perceived quality increase

1. Copy-to-clipboard buttons (T1) -- mechanical, near-zero risk, universally noticeable.
2. `DataTable` search input (T1) -- one component change, fixes 7 pages at once.
3. Group HTTP status codes by class with color badges (T1) -- a small rendering change on already-correct data.
4. Fix `PasswordGenerator`'s double-computation (T1) -- a real (if minor) implementation smell, trivial fix.
5. Preset buttons for MTU, VLAN ID, bridge priority, distance (T2/T6 adjacent) -- pure data-table additions, no new logic.
6. Cross-links between already-shipped, thematically related pages (T10) -- literally just `<Link>` additions between existing pages.
7. "Now" button on Epoch converter -- one button, immediately useful.
8. JSON/YAML/XML syntax highlighting (Utilities audit) -- a formatting-only change to already-correct output.
9. Rename the two BGP-named pages and the two routing-decision-named pages (T10) -- pure copy changes, zero logic risk.
10. Loud visual match/no-match badge on Hash verifier (T1/T2 adjacent) -- swaps a table row for a colored badge, same underlying data.

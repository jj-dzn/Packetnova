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

A second track, separate from the core build above. Where Milestones 1-15 are about _having_ every tool and visualizer, this track is about making each one best-in-class -- grounded in a full read of the actual implementation, not generic polish advice. Full findings (every strength/weakness/wow-feature call, per tool) live in `docs/TOOL_VISUALIZER_AUDIT.md`; read that first, this is where those findings become ordered work.

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

**Goal:** Teach while calculating -- contextual explanation snippets keyed to a tool's _actual computed result_, not generic prose. (Grounded lookup-table snippets, not free-generated text, so nothing can explain an edge case incorrectly.)

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
- [ ] Certificate _chain_ parsing on Certificate viewer (multiple PEM blocks, leaf -> intermediate -> root), not single-cert only
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
3. Byte-level header diagrams for TCP/UDP/IP explorers (T3) -- replaces the driest, most table-heavy pages with something people can actually _see_.
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
7. Avalanche-effect hash visualization (T6) -- visceral, rare, and directly demonstrates _why_ hashing works as an integrity check.
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

---

# Experience & Identity Roadmap

A third track, separate from both tracks above. Where Milestones 1-15 are about _having_ every tool and visualizer and T1-T10 are about making each one _best-in-class_, this track is about making the whole site _memorable_ -- a product and a small universe people want to explore, revisit, and recommend, not just a correct and polished reference. It leans on both prior tracks rather than repeating them: several of the ten milestones below extend components that already exist and work (the homepage hero, the Ping Pet creature, `Card`'s tilt/glow props, `useStepPlayer`, T9's expert-mode pattern, T10's cross-linking and color language) instead of proposing them from scratch.

Labeled `E1`-`E10` (its own namespace, same reasoning as `T1`-`T10`). Sequential and dependency-ordered, same rule as both tracks above: don't start `E4` before `E3` is genuinely done. Each milestone is scoped to be completable independently in a few hours to a few days and merged without disrupting existing functionality. Nothing here requires a backend -- no accounts, no leaderboards, no cloud sync, no server-dependent systems; everything stays fully client-side, matching the architecture every other line of this document already assumes.

## Milestone E1 — Live Interactive Hero

**Goal:** Deepen the hero experience that already exists (`TrafficStarfield`'s pointer-reactive packet/node canvas, `LatencyOrb`, `HeroStatusLine`'s type-on-load status text, `TerminalCursor`) rather than rebuilding it -- the gap isn't presence, it's that the existing hero is purely decorative and doesn't yet reward closer attention or connect to the rest of the site.

**Why it matters:** The first three seconds decide whether a visitor files PacketNova as "a toolkit" or "a place." The ambient piece is already strong; what's missing is a reason to actually interact with it beyond noticing it.

**Features included:**

- [ ] Click/tap a `TrafficStarfield` node -> brief highlight + tooltip naming a real tool or visualizer, turning the ambient graph into a light discovery affordance instead of pure decoration
- [ ] Swap the abstract dot-packets for small labeled glyphs on pointer proximity (TCP/UDP/ICMP-style tags), so "network traffic" reads as literal, not just aesthetic
- [ ] A scroll-tied "signal" moment extending `HeroStatusLine`'s typing motif -- e.g. the status line settling into its final state precisely as the hero scrolls out of view
- [ ] Idle-state variation: after a stretch with no interaction, one packet traces a path down to a random card in Popular tools/Featured visualizers, previewing where the "signal" actually goes
- [ ] All additions inherit `TrafficStarfield`'s existing reduced-motion static-frame fallback and theme-aware color re-read -- no new accessibility surface to design from zero

**Estimated effort:** Medium -- extends existing Canvas/DOM components, no new page.

**Dependencies:** None.

**Expected impact on user engagement:** High -- converts a passive background into a light discovery mechanic on the single highest-traffic page.

**Expected impact on educational value:** Low-to-medium -- mostly atmosphere, though the node-to-tool link nudges navigation toward content visitors might not have found otherwise.

**Expected impact on brand identity:** Very high -- this is the first-impression moment, and it's the one place a "toolkit vs. universe" judgment actually gets made.

**Benefits directly:** Homepage hero (`Hero.tsx`, `TrafficStarfield.tsx`, `HeroStatusLine.tsx`); indirectly funnels into Popular tools and Featured visualizers already below it.

## Milestone E2 — PacketNova Mascot

**Goal:** Give PacketNova a recurring character built from the Ping Pet creature already living in Labs (`PingPetCreature.tsx` -- a working, status-reactive, reduced-motion-safe animated SVG with idle/checking/fast/medium/slow/error states) rather than inventing an unrelated design from zero.

**Why it matters:** A recurring character is what turns "a tool I used once" into "a thing I remember by name" -- the single highest-leverage move available for the "emotional attachment" goal in the brief, and PacketNova already has the visual grammar for one, just scoped narrowly to one Labs page.

**Features included:**

- [ ] Promote `PingPetCreature`'s construction (glowing "antenna," status-driven fill and motion, animated face) into a standalone mascot component, generalizing its `status` prop from "measured latency" to arbitrary site context
- [ ] Appearance style: same geometric, non-skeuomorphic SVG language as the rest of the site's iconography -- no redesign, a respectful extension
- [ ] Placement: an idle presence on `NotFoundPage` (currently text-only), a subtle "online" pulse near the logo in `Nav`, and the guide/narrator role in E5's guided mode and E10's flagship journey
- [ ] Context-aware reactions: pleased when a calculator produces a valid result, the existing error-state face when validation fails, a checking/idle loop while a page loads -- reusing the exact visual vocabulary already built, not a new one
- [ ] Idle animation: the `pn-pet-idle` breathing/blinking keyframe already defined and already `motion-safe`-gated, reused as-is
- [ ] Documented extensibility: one clear pattern for adding a new reaction state as future sections adopt the mascot, so each new placement doesn't require redesigning it

**Estimated effort:** Medium -- mostly composition of an existing, already-working component plus new placements, not new illustration work.

**Dependencies:** None blocking, but pairs directly with E5 and E9 -- sequence those after this one.

**Expected impact on user engagement:** High -- recurring characters measurably increase return visits in comparable product categories, and this one is nearly free given what already exists.

**Expected impact on educational value:** Low directly, but meaningfully raises tolerance for reading tips and asides when a friendly character is the one delivering them (feeds E5 directly).

**Expected impact on brand identity:** Very high -- likely the single highest-leverage item in this entire roadmap for "memorable."

**Benefits directly:** `NotFoundPage`, `Nav`, Labs' Ping Pet and Ping Pet Duel (already); becomes load-bearing for E5's guided mode and E10's flagship journey.

## Milestone E3 — Universal Micro-Interactions

**Goal:** Close the specific micro-interaction gaps that remain, and audit the ones already built -- `Card`'s `interactive`/`tilt` props, `CopyButton`'s copy-to-checkmark feedback, `PageShell`'s page-transition fade-and-shimmer -- for where they should be applied but currently aren't.

**Why it matters:** Several of the mechanisms this milestone would otherwise "add" already exist and work well; the actual gap is consistency. A site that's brilliantly polished on some pages and plain on others reads as unfinished everywhere, regardless of how good the polished pages are.

**Features included:**

- [ ] Audit pass: confirm every card-shaped surface (tool/visualizer/blog/lab previews, currently unified through `PreviewCard`) actually opts into `Card`'s `interactive` and `tilt` props, and extend to any bespoke in-tool card surface that doesn't yet
- [ ] Button shimmer: `Button`'s primary variant currently only does `hover:brightness-110` -- add a single-pass light sweep on hover, matching (not duplicating) the shimmer keyframe already used for page transitions, so the two feel related instead of coincidentally similar
- [ ] A shared skeleton pattern for loading states, extending the route-level Suspense fallback already shipped in the polish pass into per-component loading states inside a tool (e.g. a calculator result that briefly recomputes)
- [ ] Scroll-linked entrance for below-the-fold homepage sections (Popular tools, Featured visualizers, Why PacketNova, Labs teaser), which currently render eagerly with no reveal treatment
- [ ] Keyboard interaction polish: confirm the on-brand `focus-visible:ring-accent` treatment already standard sitewide extends cleanly to the newer touch D-pad controls added for the Labs games
- [ ] Motion accessibility: every addition here gated behind `motion-safe:`/`prefers-reduced-motion`, matching the bar every existing animated component already meets -- no exceptions

**Estimated effort:** Medium -- broad in surface area but mechanical; most of the underlying capability already exists and just needs applying consistently.

**Dependencies:** None.

**Expected impact on user engagement:** Medium-high -- individually small, cumulatively the difference between "nice tool" and "feels expensive."

**Expected impact on educational value:** None directly.

**Expected impact on brand identity:** High -- consistency is itself a brand signal, and this milestone is entirely about closing consistency gaps rather than adding anything new.

**Benefits directly:** Every tool/visualizer/blog/lab preview card sitewide; `Button` everywhere; homepage sections; Labs game touch controls (added this session).

## Milestone E4 — Interactive Output Panels

**Goal:** Turn a first wave of six high-traffic calculators' results from "read a number" into "explore a picture," reusing the diagram primitives T3/T6 already built (`HeaderByteDiagram`, `BinaryBreakdown`, `AddressSpaceBar`, the CIDR bit-toggle sandbox) and extending them with genuinely new interaction, not just new visuals.

**Why it matters:** Calculators are the highest-traffic page type on the site by a wide margin -- upgrades here touch the most visits of anything in this roadmap, and "a number changing a picture" is a stronger moment than "a number changing a table cell."

**Features included:**

- [ ] CIDR calculator: connect the existing bit-toggle sandbox (T6) to a live `AddressSpaceBar`, so toggling a bit visibly shows where the address now falls within the block -- ties two already-shipped-but-separate visuals together
- [ ] IPv6 calculator: collapsible per-hextet view -- click a hextet to see its 16 bits individually, extending the `BinaryBreakdown` pattern IPv4 tools already have and IPv6 currently lacks
- [ ] Route summarizer: a visual merge-map showing which input CIDRs collapsed into which output summary route (currently text-list only) -- a "wow feature" gap the T-series audit itself flagged and didn't schedule
- [ ] MTU calculator: a draggable payload-size slider driving the existing fits/fragments result live, alongside (not replacing) the current numeric input
- [ ] VLAN calculator: a visual trunk diagram showing tagged/untagged VLANs across a link (soft dependency on E6's future device primitives for the polished version; a simpler version ships here regardless)
- [ ] BGP path comparison: hover-linking between the attribute input table and the elimination trace already shown, so it's immediately visible which row decided the outcome

**Estimated effort:** Large -- six separate, real per-tool builds, even though each individually is modest and reuses existing primitives.

**Dependencies:** T3 (diagram system) directly. Benefits from, but doesn't strictly require, E6's later device primitives for the VLAN diagram specifically.

**Expected impact on user engagement:** High -- the highest-traffic page type on the site gets a real upgrade.

**Expected impact on educational value:** Very high -- this is one of the two strongest educational levers in the whole roadmap (alongside E5).

**Expected impact on brand identity:** Medium-high.

**Benefits directly:** CIDR calculator, IPv6 calculator, Route summarizer, MTU calculator, VLAN calculator, BGP path comparison -- and establishes the pattern for a later wave across the rest of the 48 tools.

## Milestone E5 — Step-by-Step Learning Mode

**Goal:** Give calculators an opt-in guided mode built directly on `useStepPlayer`/`StepControls`, the exact hook and component pair already powering all 11 visualizers, instead of inventing a parallel stepping mechanism.

**Why it matters:** Visitors already learned this interaction (arrow keys, spacebar autoplay, click-to-jump, automatic reduced-motion fallback) on the visualizer pages. Reusing it means a calculator's guided mode needs zero new interaction design and feels native on arrival.

**Features included:**

- [ ] A `GuidedMode` wrapper: toggles a calculator's result panel between its normal instant view and a `useStepPlayer`-driven walk-through of the same computation, inheriting the identical keyboard nav visitors already know
- [ ] Subnet calculator: step through VLSM allocation one requested subnet at a time, showing the running remainder after each
- [ ] The MTU -> MSS -> Packet Fragmentation chain (already cross-linked in T10): step through header overhead being subtracted one layer at a time, turning three separately-cross-linked tools into one guided narrative
- [ ] BGP path comparison: reuse the same elimination-trace shape the BGP visualizer's `EliminationVisualizer` already computes, but drive it from the visitor's own entered candidates instead of a fixed example
- [ ] Route summarizer: step through the binary-merge process bit by bit
- [ ] Every guided walkthrough closes on one sentence connecting the math to a real situation (in the same voice T10 already established, e.g. "...which is why your ISP handed you a /29, not a /24")

**Estimated effort:** Large -- the mechanism is reused, but four tool-specific step sequences are real content and logic work each.

**Dependencies:** E4 -- several of the same tools get visual work there; sequencing after avoids doing that work twice.

**Expected impact on user engagement:** High for the specific "I want to actually understand this" visitor segment, which is a meaningful share of a technical audience.

**Expected impact on educational value:** Very high -- the single strongest educational lever in this roadmap.

**Expected impact on brand identity:** Medium -- reinforces "built by people who actually teach this" more than it reinforces visual identity.

**Benefits directly:** Subnet calculator, the MTU/MSS/Fragmentation chain, BGP path comparison, Route summarizer initially; the `GuidedMode` wrapper becomes available to every calculator built after.

## Milestone E6 — Shared Diagram System

**Goal:** Formalize the visual grammar already implicit across `HeaderByteDiagram`, `BinaryBreakdown`, `AddressSpaceBar`, `SequenceDiagramVisualizer`, `MiddleboxFlowVisualizer`, `LayerExplorer`, and T10's `LayerColorClasses` into one documented primitive set, and build the device-level primitives none of them currently cover: routers, switches, firewalls, NAT tables, and freeform topology.

**Why it matters:** This is infrastructure, not a feature -- but it's the direct prerequisite for both E7 (scenarios need topology) and E10 (the flagship journey needs every diagram type to compose cleanly), and it's the difference between "we built six diagrams" and "we built one system that produces diagrams."

**Features included:**

- [ ] Extract and document the visual grammar already in production (rounded device boxes, T10's two-hue checkerboard color language, the arrow/segment conventions from `SequenceDiagramVisualizer`/`MiddleboxFlowVisualizer`) into a small shared `diagram/` primitive set
- [ ] New primitives that don't exist anywhere on the site yet: simple, geometric router/switch/firewall icon components, matching the logo's node-and-connection visual language -- consistent with the design system's explicit "no router/cloud clichés" rule, not literal skeuomorphic device art
- [ ] A `NatTableDiagram` primitive (inside/outside address-port mapping rows) -- the NAT flow visualizer currently animates the packet transform but never shows the table state actually driving it
- [ ] A minimal `TopologyCanvas` primitive: freeform node-and-link layout, generalizing the fixed hand-placed positions already used in the OSPF SPF visualizer into something reusable -- the explicit prerequisite T5's future full topology-editing work and this roadmap's E7 both need
- [ ] One worked example proving reuse concretely: the same `TopologyCanvas` used in a tool, a visualizer, and lightly embedded in a blog post, rather than just asserting the system is reusable

**Estimated effort:** Large -- this is infrastructure work, sized like a platform investment rather than a single feature.

**Dependencies:** T3 (existing diagram work) as direct predecessor. Blocks E7 and the topology-editing half of T5's still-open future work.

**Expected impact on user engagement:** Indirect -- invisible as a feature on its own, but everything built on top of it after ships faster and more consistently.

**Expected impact on educational value:** High indirectly -- device-level diagrams (router/switch/firewall/topology) are the single category of visual most conspicuously absent from the site today.

**Expected impact on brand identity:** High -- visual consistency across every future diagram directly extends T10's cohesion work from "cross-links between pages" to "shared visual language between diagrams."

**Benefits directly:** NAT flow visualizer (table diagram), OSPF SPF visualizer (topology primitive), every tool/visualizer built after; direct groundwork for E7 and E10.

## Milestone E7 — Scenario Simulator

**Goal:** Chain multiple already-shipped, already-cross-linked (T10) tools into guided troubleshooting scenarios, so PacketNova reads as a lab a visitor works through, not a folder of independent calculators.

**Why it matters:** This is the most direct "feels like a lab" lever in the roadmap, and it's nearly free in tool-building terms -- every scenario below composes tools that already exist, using narrative sequencing as the only genuinely new work.

**Features included:**

- [ ] Site-to-site VPN failure: VPN Tunnel Overhead calculator -> MTU calculator -> Packet Fragmentation calculator -> VPN Packet Flow visualizer, framed around the exact "small requests work, large transfers hang" scenario T10's own MSS calculator prose already describes
- [ ] Subnetting mistake: Subnet calculator (VLSM) -> Route Summarizer -> Longest Prefix Match simulator, framed as "why did this host get the wrong route"
- [ ] Routing black hole: Route lookup simulator -> Administrative Distance reference -> Next-hop selection visualizer
- [ ] NAT problem: NAT flow simulator -> a walkthrough of why an inbound connection fails without port forwarding (pairs naturally with T4's planned PAT/overload mode)
- [ ] MTU issue: the MTU -> MSS -> Fragmentation chain, using E5's guided mode, framed end-to-end as one scenario instead of three separate tool visits
- [ ] BGP path selection: BGP path comparison -> BGP best path selection visualizer, framed as "why is traffic taking the long way"
- [ ] VLAN misconfiguration: VLAN calculator -> 802.1Q tag explorer, framed as "why can't these two hosts talk"
- [ ] Each scenario is a thin new page (`/scenarios/:slug`) that narrates a problem, embeds the existing tools/visualizers in sequence via direct component reuse (not duplicated logic), and closes on a "what actually fixed it" summary

**Estimated effort:** Large -- narrative and sequencing work across many existing pages, though no tool needs to be rebuilt to support it.

**Dependencies:** T10 (cross-linking) directly extends into this. Benefits from E6's topology primitive for the NAT and routing scenarios specifically, though the VPN/MTU/BGP/VLAN scenarios don't strictly need it.

**Expected impact on user engagement:** Very high -- the most "lab," least "reference site" feature in the roadmap.

**Expected impact on educational value:** Very high -- problem-first framing is how networking is actually taught and actually debugged in the field, distinct from tool-first framing everywhere else on the site.

**Expected impact on brand identity:** High -- directly differentiates from every competing calculator site, none of which chain tools into scenarios.

**Benefits directly:** The VPN tools trio, the IP tools trio, Routing tools, the NAT/VPN visualizers, the BGP tools, the VLAN/802.1Q tools -- recombines nearly all of the original Milestone 8 tool categories into new sequences.

## Milestone E8 — Expert Mode

**Goal:** Generalize T9's already-proven "advanced toggle" pattern -- currently scoped to four tools (BGP path comparison, TCP header explorer, VPN Tunnel Overhead calculator, STP overview) -- to the rest of the catalog, using the identical UX so it never has to be relearned tool to tool.

**Why it matters:** T9 already answered the interaction-design question (a `Pill` toggle, hidden-by-default advanced fields); this milestone is a rollout of a proven pattern plus real content, not a new mental model for visitors to learn.

**Features included:**

- [ ] The same `Pill`-toggle "expert mode" convention T9 established, rolled out to tools currently without one, so the pattern reads as one sitewide feature rather than four unrelated ones
- [ ] Raw binary/hex views wherever a tool currently shows only decimal or dotted-decimal (IPv6 calculator, MAC tools, the Base converter's less-common bases)
- [ ] RFC references as a footer line on every reference tool (DNS record types -> RFC 1035, DHCP options -> RFC 2132, etc.) -- already-correct data, just currently uncited
- [ ] CLI-equivalent output behind the toggle: Cisco IOS-style config snippets on the VLAN calculator, Subnet calculator, and STP overview -- the single most-requested "professional trust" gap identified in the T-series audit
- [ ] Vendor-specific behavior notes on Administrative Distance reference (Cisco and Juniper defaults genuinely differ; document both instead of silently picking one)
- [ ] Performance-implication asides behind the same toggle on TCP header explorer (e.g. window size vs. bandwidth-delay product)

**Estimated effort:** Medium -- the interaction pattern is a known quantity; this is content and per-tool wiring, not new UX design.

**Dependencies:** T9 directly (extends its exact pattern). T4 (professional features) for the tools whose expert content depends on features not yet shipped.

**Expected impact on user engagement:** Medium -- specifically serves returning and professional visitors rather than first-time ones.

**Expected impact on educational value:** High for the segment it serves -- this is depth, not breadth, and it's depth the rest of the roadmap doesn't otherwise add.

**Expected impact on brand identity:** High -- "the free tool a working engineer actually keeps a tab open for" is a distinct, earned position most competing sites don't attempt.

**Benefits directly:** IPv6 calculator, MAC tools, Base converter, DNS/DHCP reference tools, VLAN/Subnet calculators, STP overview, Administrative Distance reference, TCP header explorer.

## Milestone E9 — Ambient Worldbuilding

**Goal:** Extend the sci-fi identity already established (`TrafficStarfield`, `LatencyOrb`, `TerminalCursor`, the Konami code -> retro terminal easter egg) from "the homepage hero has atmosphere" to "the whole site is one coherent universe" -- strictly inside the design system's own stated restraint boundary: atmosphere lives in the chrome, never inside a calculator's input or output area.

**Why it matters:** This is the specific gap between "an excellent, well-designed toolkit" and "a memorable universe" named in the brief. The pieces already shipped prove the aesthetic works; this milestone is about presence -- making sure it shows up everywhere the site currently goes quiet.

**Features included:**

- [ ] Footer: replace the current static link bar with a small interactive strip -- a live "signal" dot reusing `LatencyOrb`'s exact pulse, and a starfield sliver reusing `TrafficStarfield`'s canvas at a tiny scale, so the atmosphere established at the top of every page also exists at the bottom
- [ ] A new About page (doesn't exist yet): the one page on the site built for reading rather than doing, telling the "nova" origin and metaphor directly, in the same dark/glow voice as the rest of the site
- [ ] More hidden terminal commands beyond the already-shipped Konami code -> `coffee.exe` precedent, discoverable the same way -- typed, never advertised
- [ ] Subtle time-of-day or seasonal variation in starfield density or accent warmth -- decorative only, never touching layout or contrast, fully disabled under reduced-motion
- [ ] A rare, non-looping "shooting star" or packet-burst moment in the hero starfield -- a "did you just see that" moment for a returning visitor, not a constant animation
- [ ] E2's mascot makes a background cameo on the About and 404 pages specifically, tying worldbuilding and mascot together rather than building each in isolation

**Estimated effort:** Medium -- individually small additions, each reusing an animation primitive that already exists.

**Dependencies:** E2 (mascot) for the About/404 cameo specifically; otherwise independent.

**Expected impact on user engagement:** Medium-high for returning visitors specifically -- worldbuilding rewards a second and third visit more than a first one.

**Expected impact on educational value:** None directly.

**Expected impact on brand identity:** Very high -- this is the milestone most directly aimed at the brief's "memorable" and "emotional attachment" goals.

**Benefits directly:** Footer (every page), the new About page, the retro terminal, the homepage hero, `NotFoundPage`.

## Milestone E10 — Network Journey Experience

**Goal:** The flagship -- a single, continuous experience following one packet from a client device to a remote server, passing through every major concept the site currently teaches separately, built by composing E6's shared diagram primitives and the site's existing visualizers rather than starting from zero.

**Why it matters:** Every other visualizer on the site teaches one concept in isolation. Nothing currently teaches the full stack as one continuous story -- this is the single feature most likely to be what someone means when they recommend PacketNova to a friend.

**Features included:**

- [ ] One continuous, `useStepPlayer`-driven journey: client -> TCP handshake (reuses `TcpHandshakeVisualizer`'s existing sequence data) -> TLS handshake (reuses `TlsHandshakeVisualizer`) -> IP header/encapsulation (reuses `PacketEncapsulationVisualizer` + `HeaderByteDiagram`) -> VLAN tagging (802.1Q) -> routing/next-hop decision -> NAT translation -> VPN tunnel (offered as an optional fork) -> BGP path selection across "the internet" -> arrival at the destination server
- [ ] Built as composition, not reimplementation: every stage reuses the exact visualizer or tool component already shipped for that concept, wrapped in one connecting narrative shell -- the same reuse-not-rebuild principle E7's scenarios already establish
- [ ] A persistent journey map (sidebar on desktop, bottom rail on mobile) showing every stage at a glance, current position highlighted, each stage directly clickable -- effectively a site-wide table of contents disguised as a story
- [ ] Genuine branch points where the outcome depends on a choice ("VPN or direct?", "NAT or public IP?"), so a second run-through isn't identical to the first
- [ ] E2's mascot travels with the packet as guide and narrator throughout -- its most substantial use anywhere on the site
- [ ] Featured directly from the homepage hero (E1) as the primary "explore" call to action, alongside the existing Browse tools / Explore visualizers buttons

**Estimated effort:** Large -- a genuinely new flagship page, even though most of its content is composed from components that already exist.

**Dependencies:** E6 (shared diagram system) directly. Benefits substantially from E2 (mascot), E5 (guided mode), and E7 (scenario framing) already being shipped, since this milestone is effectively the sum of all three.

**Expected impact on user engagement:** Very high -- designed explicitly as the "share this with a friend" moment.

**Expected impact on educational value:** Very high -- the only place on the site the full protocol stack is taught as one continuous story instead of eleven separate visualizers.

**Expected impact on brand identity:** Defining -- the single feature most likely to become synonymous with the product itself.

**Benefits directly:** TCP and TLS handshake visualizers, Packet Encapsulation visualizer, VLAN/802.1Q tools, routing tools, NAT flow visualizer, VPN packet flow visualizer, BGP tools -- ties together nearly the entire visualizer catalog into one experience.

---

## Final deliverables

### Versioned release roadmap

Each milestone lands as one release, in the same dependency order the milestones are already sequenced in.

| Version | Milestone | Headline                                                                                      |
| ------- | --------- | --------------------------------------------------------------------------------------------- |
| v1.1    | E1        | Live interactive hero deepened -- clickable nodes, literal packet glyphs, idle-state previews |
| v1.2    | E2        | PacketNova gets a mascot, built from the existing Ping Pet creature                           |
| v1.3    | E3        | Universal micro-interactions -- consistency audit + button shimmer + loading states           |
| v1.4    | E4        | Six calculators get interactive output panels (CIDR, IPv6, Route summarizer, MTU, VLAN, BGP)  |
| v1.5    | E5        | Step-by-step guided mode ships on four calculators, reusing the visualizer step player        |
| v1.6    | E6        | Shared diagram system -- router/switch/firewall/NAT-table/topology primitives                 |
| v1.7    | E7        | Scenario Simulator -- seven guided troubleshooting labs chaining existing tools               |
| v1.8    | E8        | Expert mode generalized from 4 tools to the full catalog                                      |
| v1.9    | E9        | Ambient worldbuilding -- interactive footer, About page, more easter eggs                     |
| v2.0    | E10       | Network Journey Experience -- the flagship end-to-end packet journey                          |

### The 10 highest-impact improvements by effort-to-value ratio

1. Mascot promoted from the existing `PingPetCreature` (E2) -- the component already works; this is placement and a `status` prop generalization, not new illustration.
2. `CopyButton`/`Card` consistency audit (E3) -- the mechanisms already exist and work; this is finding and fixing the places that don't use them yet.
3. Click-to-highlight starfield nodes (E1) -- a small addition to a canvas component that's already rendering and already pointer-aware.
4. Route summarizer merge-map visualization (E4) -- a single tool, already flagged as a gap by the T-series audit itself, with no dependency on anything not yet built.
5. `GuidedMode` wrapper around `useStepPlayer` (E5) -- the hook and its keyboard handling already exist; the wrapper is thin.
6. RFC references on reference tools (E8) -- pure content addition to already-correct data, zero logic risk.
7. Interactive footer signal dot (E9) -- reuses `LatencyOrb` verbatim at a smaller size.
8. BGP attribute-table-to-elimination-trace hover linking (E4) -- both data structures already exist on the same page; this connects them visually.
9. Additional hidden terminal commands (E9) -- extends an existing, already-built easter-egg mechanism (`useKonamiCode` + retro terminal).
10. CLI-equivalent config snippets behind T9's existing expert-mode toggle (E8) -- the toggle and the pattern already ship on 4 tools; this is content for more of them.

### The 5 features most likely to make PacketNova stand out from every other networking site

1. **Scenario Simulator (E7)** -- no competing free calculator site chains its own tools into guided troubleshooting labs; everything else is single-tool, single-purpose.
2. **Network Journey Experience (E10)** -- a continuous, branching, full-stack packet journey is not something any comparable site attempts at all.
3. **A real mascot with sitewide context-aware reactions (E2)** -- most networking tool sites have no character, let alone one that reacts to what a visitor is doing.
4. **Shared diagram system with true topology primitives (E6)** -- router/switch/firewall/NAT-table/freeform-topology diagrams, reused consistently across tools, visualizers, and blog posts, is meaningfully rarer than one-off illustrations per page.
5. **Ambient worldbuilding tied to a documented sci-fi identity (E9)** -- most competitors are visually interchangeable dev-tool sites; PacketNova already has a distinct visual thesis (`DESIGN_SYSTEM.md`'s "nova" direction) that almost nothing else in this space commits to as fully.

### The single flagship feature

**The Network Journey Experience (E10).** It's the one deliverable that cannot be described as "an improved version of something that already exists" -- every other milestone in this roadmap either deepens or generalizes a component that's already shipped, which is exactly why they're each achievable in isolation. E10 is different: it's the synthesis point where the mascot (E2), the guided-mode mechanism (E5), the scenario-framing principle (E7), and the shared diagram system (E6) all combine into one continuous story spanning nearly the entire visualizer catalog. It is also, deliberately, the last milestone -- everything before it exists in part to make it achievable without a from-scratch build.

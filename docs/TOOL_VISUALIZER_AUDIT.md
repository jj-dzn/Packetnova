# Tool & Visualizer Audit

A deep product audit of every tool and visualizer live on PacketNova, based on reading the actual implementation (component + calculation logic) for all 48 tools and 10 visualizers, not generic advice. Companion to the "Tool & Visualizer Excellence Roadmap" section in `ROADMAP.md`, which turns these findings into prioritized milestones.

For each tool/visualizer: **Strengths**, **Weaknesses**, **High-impact improvements**, **Quick wins**, and one **Wow feature**.

---

## Cross-cutting findings

These aren't per-tool issues — they're properties of shared components, so fixing them once fixes many tools at once. Read this section first; it explains why certain findings repeat below.

1. **`DataTable` has zero search, filter, or sort.** It's a dumb table renderer (`src/components/ui/DataTable.tsx`) — column config and rows in, `<table>` out. Seven tools are built entirely around it with no other interactivity: UDP header, ICMP, DNS record, HTTP status, TLS version, DHCP options, and Administrative Distance reference. For a table like HTTP status codes (60+ rows) or DHCP options (dozens), there's no way to jump to what you're looking for except scrolling and reading.
2. **No copy-to-clipboard anywhere.** Confirmed across all 48 tools. Every `ResultRow` value is select-and-copy only. For a tool people actually use at work (not just learn from), this is the single most requested feature type missing.
3. **Every visualizer is a fixed, non-configurable narrated example.** Confirmed across all 10. This is a _deliberate_ choice — `EliminationVisualizer.tsx` has a comment explaining the reasoning: the adjacent tools (BGP best path selector, route lookup simulator, LPM simulator) already let you plug in your own data, so the visualizers are meant as "watch it happen" teaching companions, not calculators. Reasonable as a v1 scope decision, but it's the ceiling on how far the visualizers can go without a deliberate "let me try my own scenario" mode.
4. **Naming/scope overlap causes real confusion.** "BGP route visualizer" (a _tool_ — form-based path comparison with an 11-step trace table) and "BGP best path selection" (a _visualizer_ — fixed 3-step narrated walkthrough) cover the same subject with almost-identical names on different pages. Same problem with "Routing decision simulator" (visualizer) vs. "Route lookup simulator" (tool). A first-time visitor has no way to know these are different pages before clicking both.
5. **6 of 8 Protocol tools are pure static reference tables with no input at all** (UDP, ICMP, DNS, HTTP, TLS, DHCP) — the least interactive category on the site. TCP and IP header explorers are the exception (they pair the reference table with a live flags calculator).
6. **Accessibility foundation is genuinely strong already.** `useStepPlayer` (the hook every visualizer is built on) bakes in arrow-key navigation, spacebar play/pause, and full `prefers-reduced-motion` opt-out centrally — every visualizer inherits this for free. Step descriptions use `aria-live="polite"` so screen readers announce changes. This is a real strength, not a gap, and should be preserved as new visualizers/features are built.
7. **`RegexTester` is the most technically sophisticated tool on the site** — pattern evaluation runs in a Web Worker with a hard timeout specifically to survive catastrophic backtracking (ReDoS) without freezing the tab. Worth treating as the engineering bar for anything else that evaluates user-supplied logic.
8. **`OspfSpfVisualizer` is the only visualizer with an actual diagram** (an SVG force-graph-style topology with live node/edge coloring as Dijkstra's algorithm runs). The other 9 are text/box-based. It's the single best visual on the site and a template for what the others could become.
9. **Presets exist in exactly one tool** (`VPN Tunnel Overhead calculator`, via `tunnelOverheadPresets`). Every other tool requires typing values from scratch, including ones where a handful of "common values" presets would obviously help (VLAN calculator, MTU calculator, subnet calculator).
10. **`PasswordGenerator` has a redundant computation pattern** — it calls `generatePassword()` twice per render (once for the "Generate" button handler, once unconditionally during render) and falls back through `password ?? calc.result`. Not a correctness bug, but fragile: before the button is ever clicked, the displayed password silently changes on every unrelated re-render.

---

## IP Tools (8)

_Recently overhauled — see the IP tools enhancement commit. Audited in current (post-enhancement) state._

### CIDR calculator

- **Strengths:** Most complete IP tool on the site — network/broadcast/mask/wildcard/usable range/counts, plus (recently added) RFC-range classification and a binary breakdown with the network/host bit boundary highlighted.
- **Weaknesses:** No copy buttons. No visual diagram of the address space being carved up (text/numbers only, even with binary added).
- **High-impact improvement:** A visual "address space bar" — a single horizontal bar showing where this /24 (or whatever) sits within its parent /16 or /8, network/broadcast/usable segments colored distinctly. Turns "254 usable hosts" from an abstraction into something you can see.
- **Quick win:** Copy buttons on every `ResultRow`.
- **Wow feature:** Click any bit in the binary breakdown to toggle it and watch every downstream value (network, broadcast, range) recompute live — turns the tool into a subnetting sandbox instead of a one-shot calculator.

### Subnet calculator (equal split + VLSM)

- **Strengths:** Two real modes now — equal split and VLSM (named, variable-sized, largest-first allocation, RFC 3021-aware). The VLSM table is the most information-dense, useful output on the site.
- **Weaknesses:** VLSM rows show no efficiency signal (e.g. "62 available, 50 requested, 12 to spare") — you can't tell at a glance how tightly a request fits its allocated block. No drag-to-reorder for VLSM rows. Equal-split mode's binary breakdown doesn't extend into the per-subnet table rows.
- **High-impact improvement:** Per-VLSM-row efficiency bar/badge (spare capacity as a percentage), so oversized allocations are visually obvious.
- **Quick win:** Copy-all-as-CSV or copy-all-as-text button for the results table (both modes) — this is exactly the kind of output people paste into documentation.
- **Wow feature:** A visual block diagram of the base network as a rectangle, subdivided live into labeled, proportionally-sized VLSM chunks as you type — literally see the allocation instead of reading a table.

### IPv6 calculator

- **Strengths:** Expand/compress/classify plus (recently added) subnetting with a smart preview (first 5 / gap / last 5) for splits too large to enumerate — correct use of BigInt for 128-bit math.
- **Weaknesses:** No EUI-64 interface ID generation (a very common real-world IPv6 task: "what's my SLAAC address given this MAC?"). No solicited-node multicast address derivation. Classification list is shorter than the IPv4 one.
- **High-impact improvement:** EUI-64 / SLAAC address generator given a prefix + MAC address — one of the most commonly needed IPv6 calculations that has no home anywhere on the site right now.
- **Quick win:** Copy button on expanded/compressed/subnet values.
- **Wow feature:** A visual "anatomy of an IPv6 address" diagram — global routing prefix / subnet ID / interface ID segments color-coded and labeled directly under the address as you type.

### Wildcard mask calculator

- **Strengths:** Clean, correct, accepts either a mask or a bare prefix length — sensible input flexibility.
- **Weaknesses:** No explanation of _when_ you'd reach for a wildcard mask vs. a subnet mask (ACLs, OSPF `network` statements) — someone learning this has no idea why this tool exists as distinct from the subnet mask they already have.
- **High-impact improvement:** A one-line contextual note keyed to the actual use case ("used in ACLs and OSPF network statements, where a 0 bit means 'must match' instead of 'don't care'").
- **Quick win:** Add the binary breakdown component (already built for other IP tools) — trivial to wire in, and wildcard masks are one of the clearest binary-education opportunities on the site (inverted bits).
- **Wow feature:** Side-by-side subnet-mask-vs-wildcard-mask binary view showing the bit inversion animate on input change.

### IP range calculator

- **Strengths:** Correct greedy CIDR-decomposition algorithm, now reused by the route summarizer — good internal reuse.
- **Weaknesses:** No classification of the range (is this a private range? does it span a documentation block?). No visual indication of _why_ a range needed multiple CIDR blocks instead of one (alignment).
- **High-impact improvement:** A short "why not one block" explanation when the decomposition produces more than one CIDR — e.g. "10.0.0.5-10.0.0.20 isn't power-of-two-aligned, so it takes 4 blocks to cover exactly."
- **Quick win:** Copy-all button for the resulting CIDR block list.
- **Wow feature:** Visual number-line showing the start/end range with the decomposed CIDR blocks laid out underneath as colored segments.

### Broadcast calculator

- **Strengths:** Recently fixed from being a near-duplicate of Network Address calculator — now has a distinct, coherent focus (broadcast domain, wildcard mask, binary view with host bits highlighted, a plain-English "what this address does" note).
- **Weaknesses:** Doesn't mention that broadcast doesn't really apply the same way on modern switched/VLAN networks vs. classic shared-media Ethernet — a nuance worth a sentence for anyone taking the concept at face value.
- **High-impact improvement:** A "did you know" aside about `255.255.255.255` (limited broadcast) vs. the subnet's directed broadcast — genuinely useful, commonly confused distinction.
- **Quick win:** Copy button.
- **Wow feature:** Animate the binary breakdown host bits flipping from the input address's actual bits to all-1s, visually showing _why_ the broadcast address is what it is rather than just stating it.

### Network address calculator

- **Strengths:** Also recently fixed — now focused on classification (RFC 1918/5735/etc.) rather than duplicating Broadcast calculator's output.
- **Weaknesses:** Classification label is static text; doesn't explain practical implications (routability, NAT requirement) inline.
- **High-impact improvement:** Extend the classification result with a one-line practical implication per category (e.g. private → "not routable on the public internet without NAT").
- **Quick win:** Copy button.
- **Wow feature:** A small inline "where does this sit" visual — a compressed bar of the entire IPv4 address space (0.0.0.0 to 255.255.255.255) with a marker showing roughly where this address falls and which special ranges are nearby.

### Route summarizer

- **Strengths:** Newest tool, genuinely useful and rare among free tools (most subnet calculators don't do route aggregation). Correct interval-merge + CIDR-decomposition algorithm, clear before/after reduction stat.
- **Weaknesses:** No visualization of _which_ input routes merged into which output route — with more than a few inputs, the mapping is invisible. No handling/warning for genuinely overlapping (not just adjacent) input routes distinctly from simple adjacency.
- **High-impact improvement:** Group the output display by showing which input lines contributed to each aggregate route (e.g. collapsible groups), so the "why" of each merge is traceable.
- **Quick win:** Copy-all button for the output route list.
- **Wow feature:** A live visual timeline/bar showing input ranges as colored segments merging into fewer, wider output segments as you type — the aggregation made visible, not just stated as a number.

---

## VPN Tools (7)

_Uniform pattern: numeric inputs, `ResultRow` output, minimal educational framing. Only the Latency and Tunnel Overhead calculators add any contextual prose at all._

### VPN tunnel overhead calculator

- **Strengths:** Only tool on the entire site with presets (WireGuard, IPsec, OpenVPN, etc. — real per-protocol byte overhead figures) plus a custom option. Genuinely useful, correctly framed.
- **Weaknesses:** Presets aren't sourced/cited (a footnote linking to how each figure was derived would build trust for a technical audience). No comparison view across multiple tunnel types at once.
- **High-impact improvement:** A comparison table mode — show effective MTU/overhead % for _all_ presets side by side instead of one at a time, so the actual decision ("which protocol costs me the least overhead") is answerable in one view.
- **Quick win:** Cite the source/version each preset's byte count is based on.
- **Wow feature:** A stacked bar showing the link MTU visually divided into "payload" vs. "overhead," updating live as the preset changes.

### MTU calculator

- **Strengths:** Simple, correct, clearly states fit/no-fit and excess bytes.
- **Weaknesses:** No connection to the Packet Fragmentation calculator (a natural next step when a payload doesn't fit) or the DF-flag concept from the IP header explorer. No common-MTU presets (Ethernet 1500, PPPoE 1492, etc.).
- **High-impact improvement:** Common-MTU preset buttons (Ethernet, PPPoE, IPsec, GRE, Jumbo frames) — this is one of the most preset-friendly tools on the site and currently has zero.
- **Quick win:** Link to Packet Fragmentation calculator when the payload doesn't fit ("see what fragmentation looks like →").
- **Wow feature:** A visual "does it fit" bar — payload length vs. effective MTU as two overlapping bars, red overflow segment when it doesn't fit.

### MSS calculator

- **Strengths:** Correctly separates IP and TCP option overhead, supports IPv4/IPv6 header size difference.
- **Weaknesses:** No connection to MTU calculator despite being the natural next question ("given this MTU, what's my MSS"). Doesn't explain MSS clamping (a real, common VPN/router feature directly relevant to this exact calculation).
- **High-impact improvement:** A short explanation of MSS clamping and why routers modify this value in transit — directly relevant to the VPN tools category this lives in.
- **Quick win:** Pull the MTU value from MTU calculator's last input via a shared "recently used" value, or at minimum a "chain from MTU calculator" link.
- **Wow feature:** None strong enough to stand out — this tool is correct and complete but inherently narrow; effort is better spent linking it into the MTU→MSS→Fragmentation chain than adding its own flourish.

### Latency calculator

- **Strengths:** Best contextual copy on the VPN tools — explicitly caveats that this is propagation delay only, not real-world latency (processing/queuing/serialization also matter). Sensible default (200 km/ms ≈ 2/3 c).
- **Weaknesses:** No presets for common distances/routes (e.g. "New York to London," "cross-continental US") — currently pure numeric entry with no real-world anchor.
- **High-impact improvement:** Distance presets for well-known city-pair or common cloud-region routes, so people without an exact km figure can still get a useful answer.
- **Quick win:** A short table of medium presets (fiber ~200 km/ms, copper ~180-200 km/ms, satellite propagation note) instead of a bare numeric input.
- **Wow feature:** A simple animated "packet" traveling along a line between two labeled points, taking visually longer for greater distances — makes propagation delay tangible instead of abstract.

### Transfer time calculator

- **Strengths:** Clean duration formatting (seconds → minutes → hours, human-readable).
- **Weaknesses:** No account for TCP overhead/protocol efficiency (assumes 100% of bandwidth is usable, which the adjacent Bandwidth Estimator explicitly does _not_ assume) — an inconsistency between two related tools in the same category.
- **High-impact improvement:** Optionally chain through Bandwidth Estimator's overhead logic — or at minimum a caveat noting that real transfers rarely sustain 100% of nominal bandwidth.
- **Quick win:** File-size unit presets (common file sizes: a 4K movie, a Linux ISO, a database backup) as quick-fill buttons.
- **Wow feature:** A live progress-bar-style animation showing the transfer "in progress" at a speed roughly scaled to the calculated time (capped for usability) — a small, satisfying, on-theme touch.

### Bandwidth estimator

- **Strengths:** Correctly separates raw bandwidth from per-packet overhead and typical packet size — a legitimately more nuanced calculation than most free tools attempt.
- **Weaknesses:** Doesn't explain _why_ smaller packet sizes cost more overhead percentage (an important, teachable insight this specific tool's math already reveals).
- **High-impact improvement:** A small live chart — effective bandwidth vs. packet size, so the "smaller packets = more overhead" relationship is visible, not just computable one value at a time.
- **Quick win:** Common packet-size presets (64B minimum Ethernet, 1500B standard MTU, 9000B jumbo).
- **Wow feature:** The live chart above, doubling as both an explanation and a genuinely novel piece of content (few free tools visualize this relationship at all).

### Packet fragmentation calculator

- **Strengths:** The most detailed VPN tool — full per-fragment breakdown (payload, total size, offset, MF flag) in a real table, technically accurate to actual IPv4 fragmentation mechanics.
- **Weaknesses:** No visual representation of the fragments — the table is correct but abstract; nothing shows the original packet being physically split.
- **High-impact improvement:** A visual "packet splitting into fragments" diagram — the original packet as a bar, fragments as proportionally-sized sub-bars below it, offset positions aligned visually.
- **Quick win:** Link to the DF-flag section of the IP header explorer, since fragmentation and the Don't Fragment bit are directly related concepts currently living on two disconnected pages.
- **Wow feature:** The visual fragment-splitting diagram above, animated so fragments visibly "peel off" the original packet — the single best fit for a satisfying animation on this entire category.

---

## Routing (5)

### BGP route visualizer _(tool — note the name collision with the BGP best path *visualizer*, see cross-cutting finding #4)_

- **Strengths:** By far the most complete BGP tool on the site — full attribute set (weight, local pref, AS-path, origin, MED, eBGP/iBGP, IGP metric, route age, router ID), correct standard tie-break order, and a real step-by-step elimination trace table.
- **Weaknesses:** Confusing name overlap with the BGP best path _visualizer_. Dense input form (11 fields per candidate) with no guidance on which attributes matter when — someone unfamiliar with BGP selection order has no on-ramp.
- **High-impact improvement:** Rename to disambiguate from the visualizer (e.g. "BGP path comparison tool"), and cross-link the two explicitly ("see this decided step-by-step →").
- **Quick win:** Collapse rarely-changed fields (router ID, neighbor IP, route age) behind a "show advanced attributes" toggle so the common case (weight/local-pref/AS-path/MED) isn't buried.
- **Wow feature:** Highlight the _deciding_ attribute directly on the winning candidate's card (not just in the trace table below) — an instant visual answer to "why did this path win," not just "which path won."

### Longest prefix match simulator

- **Strengths:** Editable route table with add/remove, winning row highlighted directly in the results table — good immediate feedback loop.
- **Weaknesses:** No validation feedback when a typed CIDR is malformed until you look at the "Matches?" column. No sorting by prefix length in the display (routes shown in entry order, not match-specificity order).
- **High-impact improvement:** Sort the results table by prefix length (most specific first) so the "why did this win" story reads top-to-bottom instead of requiring a scan.
- **Quick win:** Inline red border/text on a route row with an invalid CIDR, rather than only surfacing it in the results column.
- **Wow feature:** A visual number-line/Venn-style diagram showing how each route's range overlaps the destination address, with the winning (most specific/innermost) range highlighted — LPM as a picture, not just a table.

### Route lookup simulator

- **Strengths:** Two-stage decision (LPM first, then AD as tiebreaker) is modeled correctly and explicitly labeled ("Decided by"), which is the single most common routing-table misconception this tool correctly teaches.
- **Weaknesses:** AD picker is a plain dropdown of _source names_, not distances directly — someone who already knows "I want AD 5" has to remember which named source that maps to.
- **High-impact improvement:** Same visual overlap diagram idea as LPM simulator, extended to show the AD tiebreak explicitly when prefix lengths tie.
- **Quick win:** Show the numeric AD value directly in the Select's visible (not just option) text, and let free-entry of a raw number as an alternative to the dropdown.
- **Wow feature:** A tiny animated "decision tree" — two branch points (LPM, then AD) that visibly prune down to the winner, reusable in spirit from the EliminationVisualizer pattern already built for the routing/BGP _visualizers_.

### Administrative distance reference

- **Strengths:** Simple, accurate, exactly what it claims to be.
- **Weaknesses:** Inherits cross-cutting finding #1 in full — no search, and this is genuinely one of the tables people want to search ("what's EIGRP's AD again?") rather than scan.
- **High-impact improvement:** A search/filter input above the table (the single highest-leverage `DataTable` fix, since this table is short enough that search alone would fix it completely).
- **Quick win:** Sort by distance ascending by default (currently unclear if it's already sorted — worth confirming and making explicit) so "lower wins" reads naturally top-to-bottom.
- **Wow feature:** Not a strong candidate for a wow feature — this is a reference table and should stay simple; the win here is pure findability, not delight.

### Metric comparison tool

- **Strengths:** Pairs a live OSPF cost calculator with a reference table explaining how _every_ major protocol computes distance — good hybrid of calculator + reference in one page.
- **Weaknesses:** The OSPF calculator and the comparison table feel like two unrelated halves bolted together — no visual or narrative bridge between "here's OSPF's number" and "here's how that compares to EIGRP's composite metric."
- **High-impact improvement:** Add worked mini-examples for EIGRP and RIP metrics alongside the live OSPF one, so "metrics aren't comparable across protocols" (the tool's own stated thesis) is demonstrated with numbers, not just asserted in prose.
- **Quick win:** Common reference-bandwidth presets (100 Mbps default vs. modern 10G/40G links, where OSPF's classic default badly under-differentiates) — a well-known real-world OSPF gotcha this tool is perfectly positioned to teach.
- **Wow feature:** A single visual bar comparing "OSPF cost," "EIGRP composite metric," and "hop count" for the same hypothetical link at different bandwidths — visually proving why you can't compare metrics across protocols.

---

## Switching (5)

### VLAN calculator

- **Strengths:** Correctly classifies VLAN ID ranges (reserved/normal/extended) with contextual notes.
- **Weaknesses:** Very thin for a whole tool — one input, two outputs. No trunk/tagging context despite the category being "Switching."
- **High-impact improvement:** Merge conceptually with the 802.1Q explorer — a single "VLAN & tagging" tool where entering a VLAN ID also shows its 802.1Q tag representation, rather than two separate thin tools covering adjacent ground.
- **Quick win:** Common VLAN ID presets (1 = default, 1002-1005 = reserved on Cisco, 4095 = reserved) as clickable examples that demonstrate the classification logic.
- **Wow feature:** Not a strong standalone candidate — this tool's ceiling is capped by how little there is to a VLAN ID alone; the real opportunity is the merge with 802.1Q above.

### 802.1Q tag explorer

- **Strengths:** Correct bit-level tag construction (PCP/DEI/VLAN ID → TCI → full tag), genuinely technical.
- **Weaknesses:** No binary breakdown despite this being _the_ clearest binary-education opportunity on the whole site (a 32-bit tag with three distinctly-sized fields) — currently only hex output.
- **High-impact improvement:** A bit-level diagram of the TCI (3 bits PCP, 1 bit DEI, 12 bits VLAN ID) with each field colored and labeled — the `BinaryBreakdown` pattern from IP tools, adapted for unequal field widths.
- **Quick win:** PCP preset labels (0 = Best Effort, 5 = Voice, etc., per the standard 802.1p priority mapping) instead of a bare 0-7 number input.
- **Wow feature:** The bit-level TCI diagram above, with each field's contribution to the final hex value visibly highlighted as you change it — turns "what is a TCI" into something you can see being built.

### MAC address lookup

- **Strengths:** Honest about its own limitation (small, individually-verified OUI set, not the full ~50,000-entry IEEE registry) — good, trustworthy framing rather than pretending completeness.
- **Weaknesses:** "Not in our reference set" is a dead end — no path forward for the (likely common) case of an unrecognized OUI.
- **High-impact improvement:** When the OUI isn't recognized, at least still show the structural facts that don't require a lookup (multicast bit, locally-administered bit, OUI/NIC split) rather than implying the tool has nothing to offer.
- **Quick win:** A visible note on the page (not just a caveat) suggesting the IEEE's own public OUI search as the completeness fallback, so users aren't left stuck.
- **Wow feature:** Expand the reference set meaningfully (even a few hundred well-known vendors covers the vast majority of real-world lookups) — this is more a content investment than a UI feature, but it's the actual "wow" this tool needs.

### MAC formatter

- **Strengths:** Simple, correct, exactly what it claims.
- **Weaknesses:** No copy buttons (especially relevant here — format conversion is a copy-paste task by definition).
- **High-impact improvement:** N/A — this tool is appropriately minimal for its scope.
- **Quick win:** Copy buttons on all three output formats. This is the single tool on the site where the absence of copy-to-clipboard is most obviously a missing feature, since the entire point is "get this MAC into a different format so I can paste it somewhere."
- **Wow feature:** Auto-detect and accept _any_ reasonable input format (already partially implied by "convert between formats" — confirm the parser truly accepts colon/hyphen/dot/bare-hex interchangeably) and echo back "detected: Cisco dotted format" as a small trust-building touch.

### STP overview

- **Strengths:** Correct root bridge election (priority, then MAC tiebreak), plus genuinely good explanatory prose about root/designated/blocking ports below the calculator — the best-written static explanation text on the whole site.
- **Weaknesses:** The explanation talks about root ports, designated ports, and blocking states, but the tool itself only computes the root bridge — none of those other concepts are actually visualized or calculated, just described.
- **High-impact improvement:** Extend the calculator to a small 3-4 switch topology (fixed, like the visualizers) that actually computes and displays root/designated/blocked ports, not just the root bridge — closing the gap between what the prose promises and what the tool shows.
- **Quick win:** Bridge priority presets (4096, 8192, ..., 32768 default, per the standard Cisco increment-of-4096 convention) instead of a bare number input.
- **Wow feature:** A small topology diagram (3-4 switches, a few links) with the root bridge, root ports, designated ports, and the one blocked port all color-coded live as priorities change — this would make STP's "why is this port blocked" click instantly in a way prose never will.

---

## Protocols (8)

_Six of eight are pure static reference tables (cross-cutting finding #5). TCP and IP header explorers are the exceptions and set the bar for what the others could become._

### TCP header explorer

- **Strengths:** Live flags calculator (checkboxes → hex/decimal) paired with the full field reference table — the best-executed "reference + calculator" hybrid in the Protocols category.
- **Weaknesses:** Flags calculator only covers the flags byte; the rest of the header (sequence/ack numbers, window size, checksum) is reference-only with no live construction.
- **High-impact improvement:** Extend the live calculator to build a _complete_ mock TCP header from user input (ports, seq/ack, flags, window) and show the resulting byte layout — turning "explorer" into an actual header builder.
- **Quick win:** Highlight the corresponding table row when a flag checkbox is toggled, visually linking the live calculator to the static reference below it (currently two disconnected sections on the same page).
- **Wow feature:** A byte-by-byte visual header diagram (20 bytes as labeled, proportionally-sized boxes) that highlights and updates live as flags change — the header stops being a table and becomes a picture of the actual bytes on the wire.

### UDP header explorer

- **Strengths:** Correctly minimal, matching UDP's genuinely simple 8-byte header.
- **Weaknesses:** Purely static — given how small UDP's header is (4 fields), this is the easiest Protocols tool to upgrade with a live calculator and currently has none.
- **High-impact improvement:** Add a tiny live calculator (source/dest port + length → resulting byte layout), mirroring what TCP/IP explorers already do, since UDP's header is small enough that this is a low-effort addition.
- **Quick win:** A one-line "TCP vs UDP" contrast callout (8 bytes vs. 20+, no reliability/ordering/flow control) — directly reinforces why someone would pick one over the other, which this page currently never states.
- **Wow feature:** Side-by-side visual header diagram vs. TCP's (once TCP has one) — literally see the size difference, not just read "8 bytes" vs "20 bytes."

### IP header explorer

- **Strengths:** Same strong pattern as TCP explorer — live flags calculator (DF/MF) plus full field reference.
- **Weaknesses:** Doesn't surface the Fragment Offset field's relationship to the Packet Fragmentation calculator in VPN tools, despite being the header field that calculator's whole output depends on.
- **High-impact improvement:** Cross-link directly to Packet Fragmentation calculator from the Fragment Offset row — these are two halves of the same concept currently living in unrelated categories with no connection.
- **Quick win:** Same row-highlighting idea as TCP explorer — link the flags calculator visually to its corresponding table rows.
- **Wow feature:** Same byte-by-byte header diagram idea as TCP, applied to IPv4's 20-byte header — this pattern is worth building once and reusing across TCP/UDP/IP explorers rather than three different bespoke efforts.

### ICMP explorer

- **Strengths:** Clean, accurate type/code reference.
- **Weaknesses:** Fully static (cross-cutting #1 and #5) — and ICMP specifically has a well-known "type vs. code" nuance (e.g. Type 3 has 16 different codes with very different meanings) that a flat table doesn't convey well since type and code aren't visually grouped.
- **High-impact improvement:** Group rows by type with codes nested/indented underneath, rather than one flat list — the type/code relationship is ICMP's whole structure and the current table flattens it away.
- **Quick win:** Search/filter (cross-cutting fix).
- **Wow feature:** A "ping" or "traceroute" mini-narrative — click a common scenario ("host unreachable," "TTL expired," "fragmentation needed") and see which exact ICMP type/code fires and why, connecting the abstract table to a concrete situation.

### DNS record reference

- **Strengths:** Correct, covers the common record types.
- **Weaknesses:** Only two columns (type, description) — no example record shown for each type, which is the single most useful thing missing (someone looking up "what's an SRV record" wants to see one, not just read a sentence).
- **High-impact improvement:** Add an "example" column with a realistic sample record for each type (e.g. an actual-looking MX, TXT/SPF, SRV record) — dramatically raises the practical usefulness of this exact page.
- **Quick win:** Search/filter (cross-cutting fix) — with as many record types as exist, findability matters here specifically.
- **Wow feature:** A tiny interactive DNS resolution flow (type a domain, watch a fake-but-representative resolution chain: root → TLD → authoritative → answer) — turns a static glossary into a mini visualizer, arguably deserving to graduate into the Visualizers category entirely.

### HTTP status reference

- **Strengths:** Complete, accurate, standard reference.
- **Weaknesses:** Largest table on the site with the least ability to navigate it (cross-cutting #1) — 60+ rows, no way to jump to "what's 429 again" without scrolling.
- **High-impact improvement:** Search/filter is the single highest-leverage fix on this specific page given its size — arguably the strongest case on the entire site for fixing `DataTable` first.
- **Quick win:** Group by status class (1xx/2xx/3xx/4xx/5xx) with a visible class badge/color per row — currently a flat list with no visual grouping despite class being the most natural way people think about status codes.
- **Wow feature:** A "look up my error" mode — paste a raw HTTP response's first line and get the matching entry highlighted directly, rather than requiring manual scanning.

### TLS version explorer

- **Strengths:** Good "status" column (deprecated/current/etc.) giving practical guidance, not just a historical list.
- **Weaknesses:** No connection to the Certificate viewer or Hash generator, despite TLS depending directly on both certificates and hash algorithms — three related Security/Protocols tools with zero cross-links between them.
- **High-impact improvement:** A visual timeline (not just a table) showing TLS versions plotted by year with deprecation markers — the "what changed and when" story reads far better as a timeline than a table.
- **Quick win:** Cross-link to the TLS handshake visualizer directly from this page (currently the only connection between them is being in a similar topic area, no actual link).
- **Wow feature:** The visual timeline above, with each version's row expandable to show its actual cipher suite / handshake differences — pairs naturally with the existing TLS handshake visualizer as a "read the summary here, watch it happen there" combo.

### DHCP options reference

- **Strengths:** Correct, standard reference.
- **Weaknesses:** Fully static, no connection to the DHCP concept anywhere else on the site (there's no DHCP visualizer or lease-process explainer at all — DHCP is otherwise entirely absent from the Visualizers category, a genuine content gap).
- **High-impact improvement:** This table alone won't fix it, but flag DHCP's absence from Visualizers as a real gap — a DORA (Discover/Offer/Request/Ack) sequence visualizer would fit the existing `SequenceDiagramVisualizer` pattern almost exactly, reusing infrastructure already built for TCP/TLS handshakes.
- **Quick win:** Search/filter (cross-cutting fix).
- **Wow feature:** Not on this page specifically — the wow feature here is really "build the DHCP DORA visualizer," which belongs in the Visualizers section of this audit, not as a bolt-on to a reference table.

---

## Security (8)

### Hash generator

- **Strengths:** Recently hardened against the insecure-context bug (missing `crypto.subtle` now surfaces a specific, actionable error instead of a generic failure). Supports MD5 through SHA-512 via a clean native-vs-polyfill split.
- **Weaknesses:** No file-hash progress indicator for large files (the tool accepts file input but gives no feedback during hashing of a large file — could look hung).
- **High-impact improvement:** Streaming hash progress for file mode (even a simple spinner/percentage) so large-file hashing doesn't look broken.
- **Quick win:** Copy button on the hash output — arguably the single most copy-motivated tool on the entire site (hash values exist specifically to be pasted somewhere for comparison).
- **Wow feature:** A live visual "avalanche effect" demo — type text and watch the hash change completely with a single-character edit, animated character-by-character, viscerally demonstrating why hashes are good integrity checks.

### Hash verifier

- **Strengths:** Correctly fixed alongside Hash generator's secure-context bug (shares the same underlying `computeHash`).
- **Weaknesses:** Silent-until-typed UX — matches/doesn't-match state isn't visually loud enough (currently just a `ResultRow` "Yes/No", no color/icon treatment matching the significance of a security match check).
- **High-impact improvement:** A prominent, unmissable match/no-match state (green check / red X, not just table text) — this tool exists specifically to answer one yes/no question and should answer it as loudly as `HashVerifier`'s stakes deserve.
- **Quick win:** Copy button + a "paste from clipboard" button for the expected-hash field, since that value is almost always copied from somewhere else.
- **Wow feature:** Not a strong candidate beyond the prominent match indicator above — this tool's job is narrow and the loud yes/no _is_ the wow feature once done well.

### JWT decoder / JWT inspector

- **Strengths:** Both correctly decode client-side with an explicit "not verifying the signature" disclaimer — honest about their own limits. Inspector adds real value (expiry badge, claim extraction) beyond Decoder's raw JSON dump.
- **Weaknesses:** Two separate tools/pages for closely related tasks — a user wanting "what's in this token" has to guess which of two similarly-named tools to click, and the raw-JSON and processed-claims views are never available together.
- **High-impact improvement:** Merge into one JWT tool with a raw/summary view toggle — same underlying `decodeJwt`/`inspectJwt` logic, one page, matching how the fixed Broadcast/Network Address split was resolved by giving each _distinct_ value rather than the current near-duplicate split here.
- **Quick win:** Add the expiry badge treatment from Inspector into Decoder (or vice versa) as an interim fix if a full merge isn't prioritized yet.
- **Wow feature:** Color-code each JWT segment (header/payload/signature) directly in the pasted token string itself, matching the classic jwt.io visual treatment — instantly shows _where_ in the token each decoded piece came from.

### Base64 encode/decode

- **Strengths:** Clean, minimal, correct mode toggle pattern (shared with URL Encode/Decode and JSON/Epoch tools — good consistency).
- **Weaknesses:** No copy button on the read-only output textarea (select-all is the only option). No file-to-Base64 mode (a genuinely common real use case: "base64 this image for a data URI").
- **High-impact improvement:** File input mode (drag a file, get its Base64 encoding) — meaningfully expands this tool's real-world usefulness beyond text snippets.
- **Quick win:** Copy button on the output.
- **Wow feature:** Live data-URI preview when the decoded/encoded content looks like an image (`data:image/...`) — render the actual image inline as a sanity check, a small but genuinely delightful surprise for anyone debugging a data URI.

### URL encode/decode

- **Strengths:** Same clean minimal pattern as Base64.
- **Weaknesses:** No copy button (same gap). No visual highlighting of _which_ characters got encoded (currently just shows the before/after text with no diff-style emphasis).
- **High-impact improvement:** Highlight the specific characters that changed (reusing the color treatment already built for Text Diff Viewer) — makes "what actually got encoded" legible at a glance instead of requiring a manual character-by-character comparison.
- **Quick win:** Copy button on the output.
- **Wow feature:** Not a strong standalone candidate — this tool's job is narrow; the character-highlighting improvement above effectively is its wow feature.

### Certificate viewer

- **Strengths:** The most technically impressive Security tool — parses real ASN.1/X.509 structure client-side (version, serial, signature algorithm, subject/issuer DN, validity window, SANs), with genuinely well-chosen validity badges (expired/not-yet-valid/valid).
- **Weaknesses:** No copy buttons anywhere (serial number and SANs are exactly the kind of values people need to paste elsewhere). No visual certificate chain support (single cert only — can't paste a chain and see it parsed as a sequence).
- **High-impact improvement:** Accept and parse a full certificate chain (multiple PEM blocks), showing each certificate's relationship to the next (leaf → intermediate → root) — a genuinely more advanced, more useful version of this tool that most free cert viewers don't bother with.
- **Quick win:** Copy buttons on serial number and each SAN.
- **Wow feature:** A visual validity timeline — a horizontal bar from "not before" to "not after" with "today" marked on it, instantly showing how much of the certificate's life remains (or how expired it is) without doing date math in your head.

### Password generator

- **Strengths:** Uses the browser's cryptographically secure RNG (not `Math.random`), good character-class toggles.
- **Weaknesses:** The redundant double-computation pattern flagged in cross-cutting finding #10. No strength/entropy indicator despite the tool having every input needed to compute one trivially (length × character-class count).
- **High-impact improvement:** Fix the double-computation (compute once, store in state, regenerate only on explicit action) and add a live entropy/strength indicator (bits of entropy, or a simple weak/good/strong bar) — currently the tool never tells you _how_ strong what it just generated actually is.
- **Quick win:** Copy button (currently the generated password can only be selected manually, for a tool whose entire purpose is "get this password somewhere else").
- **Wow feature:** A live entropy bar that fills up as you adjust length/character classes _before_ generating — turns the abstract "more options = more secure" idea into an immediate visual, and pairs naturally with the entropy indicator above.

---

## Utilities (8)

### JSON formatter

- **Strengths:** Clean pretty/minify toggle, correct validation with real parse errors surfaced.
- **Weaknesses:** No syntax highlighting (plain monospace text, even in the "pretty" output) — the one place on the site where syntax highlighting would have the highest expected-vs-actual gap versus competing tools.
- **High-impact improvement:** Basic JSON syntax highlighting (keys, strings, numbers, booleans in distinct colors) — every competing JSON formatter online has this; its absence here is the most conspicuous gap in the Utilities category.
- **Quick win:** Copy button on the output.
- **Wow feature:** Collapsible/foldable object and array nodes (click a `{` to collapse that branch) — turns a static formatter into an actual JSON explorer for large payloads.

### YAML formatter

- **Strengths:** Correct validation, minimal and focused.
- **Weaknesses:** Same missing syntax highlighting and copy button as JSON. No YAML-to-JSON (or vice versa) conversion despite that being an extremely common paired need.
- **High-impact improvement:** Add YAML ↔ JSON conversion mode — a genuinely high-value addition given how often the two formats need to interconvert (Kubernetes manifests, CI configs, etc.).
- **Quick win:** Copy button.
- **Wow feature:** The YAML↔JSON converter above is the real wow feature here — more valuable than any visual flourish for this specific tool.

### XML formatter

- **Strengths:** Correct formatting/validation for a format that's genuinely fiddly to hand-indent correctly.
- **Weaknesses:** Same missing highlighting/copy gaps as JSON/YAML.
- **High-impact improvement:** Syntax highlighting (tags vs. attributes vs. text content in distinct colors).
- **Quick win:** Copy button.
- **Wow feature:** Not a strong standalone candidate beyond the highlighting fix — XML's use cases are narrower than JSON/YAML's on a networking-adjacent site.

### Epoch converter

- **Strengths:** Handles both directions (epoch→date, date→epoch) with sensible live defaults (current time), seconds/milliseconds toggle.
- **Weaknesses:** No timezone selector — everything is UTC/ISO only, but a huge share of real epoch-conversion tasks are "what time was this in _my_ timezone" or "what time is this epoch value in Tokyo."
- **High-impact improvement:** A timezone selector (or at minimum, also show the browser's local timezone alongside UTC) — this is the single most commonly-needed feature this tool is missing.
- **Quick win:** A "now" button that snaps the input to the current timestamp with one click (currently only the initial default is "now"; there's no way to reset to current time without reloading the page).
- **Wow feature:** A small relative-time readout ("3 days ago" / "in 2 hours") alongside the absolute conversion — genuinely useful and something most bare epoch converters skip.

### Binary/decimal/hex converter

- **Strengths:** Clean, all four common bases at once (binary/octal/decimal/hex) rather than requiring a from/to pair selection twice.
- **Weaknesses:** No bitwise operation support (AND/OR/XOR/shift between two values) despite being adjacent territory this tool is well-positioned to cover.
- **High-impact improvement:** Not necessary — this tool is appropriately scoped as a pure converter; bitwise operations belong in a separate tool if added at all, not bolted onto this one.
- **Quick win:** Copy buttons on each of the four outputs.
- **Wow feature:** A live binary "bit grid" — each bit shown as an individually clickable/toggleable square, recomputing decimal/hex/octal live as bits are flipped (same interaction idea as the CIDR calculator's wow feature, applied generically here instead of to IP addresses specifically).

### ASCII converter

- **Strengths:** Good table output (char/decimal/hex/binary per character) for text→codes mode, sensible bidirectional support.
- **Weaknesses:** ASCII-only framing in a Unicode world — no mention of what happens with non-ASCII input (does it silently break, show replacement characters, or handle UTF-8 correctly? Not stated anywhere in the UI).
- **High-impact improvement:** Either genuinely support and label UTF-8 code points (not just ASCII), or add an explicit caveat about behavior outside the ASCII range — right now the tool's behavior on non-ASCII input is undocumented and untested from the UI's perspective.
- **Quick win:** Copy button for both the codes table and the reconstructed text.
- **Wow feature:** Not a strong candidate — this is a narrow utility; correctness/clarity on the Unicode question matters more than a visual flourish here.

### Regex tester

- **Strengths:** By far the most sophisticated tool on the site — Web Worker evaluation with a hard timeout specifically to survive catastrophic backtracking, debounced live evaluation, inline match highlighting. This is genuinely professional-grade engineering.
- **Weaknesses:** No named-group or capture-group breakdown (matches are highlighted but not decomposed into groups) — a common real need when testing a pattern with `()` groups. No regex cheat-sheet/quick-reference for common tokens.
- **High-impact improvement:** A capture-group breakdown panel showing each numbered/named group's match for every overall match, not just the highlighted full match.
- **Quick win:** A small collapsible cheat-sheet of common regex tokens (`\d`, `\w`, `(?:...)`, etc.) — genuinely useful for less-regex-fluent visitors and costs nothing computationally since it's static content.
- **Wow feature:** A "explain this regex" plain-English breakdown, decomposing the pattern token-by-token into a readable sentence (e.g. "one or more digits, followed by a literal space") — this would be a genuinely rare, high-value feature among free regex testers, and the tool's existing Worker-based architecture means it could evaluate this safely too.

### Text diff viewer

- **Strengths:** Clean line-level diff with color-coded additions/removals — does exactly what it says.
- **Weaknesses:** Line-level only — no word-level or character-level diff highlighting within a changed line (a line that changed one word shows the _entire_ line as removed+added, not just the changed word).
- **High-impact improvement:** Word-level diff highlighting within changed lines — the single biggest quality gap versus competing diff tools, most of which highlight at the word level by default.
- **Quick win:** A summary line ("3 additions, 1 removal") above the diff output.
- **Wow feature:** Side-by-side (not just unified) diff view toggle — many people specifically want to see before/after in two columns rather than an interleaved unified view, and this is a well-understood, expected feature for a diff tool that's currently entirely absent.

---

## Visualizers (10)

_All 10 share the same foundation: `useStepPlayer` (keyboard nav + reduced-motion handling) plus one of four shared step-through components (`SequenceDiagramVisualizer`, `MiddleboxFlowVisualizer`, `LayerExplorer`, `EliminationVisualizer`), or in OSPF's case, a bespoke SVG diagram. See cross-cutting findings #3, #6, #8._

### TCP three-way handshake

- **Strengths:** Clean 3-step sequence diagram, correct seq/ack numbering shown in each message label, accessible (keyboard + `aria-live`).
- **Weaknesses:** Doesn't show connection teardown (FIN/FIN-ACK/ACK) — a natural, currently-missing companion to "how a connection starts."
- **High-impact improvement:** A second linked visualizer (or an extended mode) covering the four-way close — TCP state machine education is incomplete without it, and this is the visualizer best positioned to add it given the existing infrastructure.
- **Quick win:** A small TCP state-machine diagram alongside the sequence steps, highlighting which of the 11 TCP states each side is in — currently states are named in text (`SYN_SENT`, etc.) but never shown in relation to the full state machine.
- **Wow feature:** Toggle between "happy path" and "packet loss" scenarios — show what happens when a SYN or SYN-ACK is lost and retransmitted, which is _the_ practical reason engineers actually care about this handshake in production debugging.

### TLS handshake

- **Strengths:** Correctly modern (TLS 1.3, not the outdated 1.2 full handshake most tutorials still show), accurate 1-RTT framing, good encrypted-vs-plaintext distinction called out in the description text.
- **Weaknesses:** Doesn't show TLS 1.2's handshake for comparison (a genuinely useful contrast, since "why is 1.3 faster" is best shown, not told) despite the TLS Version Explorer reference table living right next door thematically.
- **High-impact improvement:** A toggle or second mode showing the TLS 1.2 handshake (2-RTT) side by side — directly demonstrates the efficiency improvement the version reference table only describes in a table cell.
- **Quick win:** Cross-link to/from TLS Version Explorer (currently zero connection between them despite covering directly related material).
- **Wow feature:** A visible round-trip-time counter ticking up as steps progress, comparably run for both 1.2 and 1.3 side-by-side — makes "1.3 is faster" a felt, timed experience instead of an assertion.

### Packet encapsulation

- **Strengths:** Genuinely well-designed core interaction — each layer visually "wraps" around the previous one as chips accumulate, correct terminology at each stage (segment → packet → frame).
- **Weaknesses:** Ethernet trailer (FCS) is tacked onto the end rather than visually wrapping the whole frame the way a trailer conceptually should (it's a checksum over everything, but visually it just appears as one more chip in a row).
- **High-impact improvement:** A genuine nested-box visual (each layer literally drawn as a box containing the previous box) rather than a flat row of chips — would make "encapsulation" (wrapping) visually true to its name instead of implied by ordering.
- **Quick win:** Byte-count running total shown alongside each layer as it's added (e.g. "+20 bytes → 1020 bytes total") — ties the abstract concept to a concrete, incrementing number.
- **Wow feature:** The nested-box redesign above, animated so each new layer visibly "wraps around" the existing stack rather than appending beside it — this is the visualizer where the _name itself_ ("encapsulation") is currently the least visually literal, and fixing that has outsized payoff.

### OSI model explorer

- **Strengths:** Accurate, click-to-jump-to-any-layer (not just linear stepping), clean examples/data-unit reference per layer.
- **Weaknesses:** Text-only — no visual stack of boxes (the most natural, expected visual metaphor for "layers," and the one thing every OSI diagram in every textbook uses that this page doesn't).
- **High-impact improvement:** A vertical stack-of-boxes visual alongside the existing click list — layers 7 down to 1, current layer highlighted, so the spatial "stack" metaphor that gives the OSI model its name is actually visible.
- **Quick win:** Color-code each layer consistently (a fixed color per layer number) and reuse that same color wherever that layer is referenced elsewhere on the site (TCP/IP stack explorer, packet encapsulation) — currently no shared visual language ties these related pages together.
- **Wow feature:** Click a real-world action (e.g. "loading a webpage") and watch it animate down through all 7 layers with a one-line explanation at each — turns the abstract model into a concrete, memorable walkthrough.

### TCP/IP stack explorer

- **Strengths:** Correct layer-merging explanation (how OSI's 7 layers collapse into TCP/IP's 4).
- **Weaknesses:** This is the most significant gap-between-promise-and-delivery finding in the whole audit: the page's own description says "compare the TCP/IP model against OSI," but the UI never shows the two stacks side by side — only text mentioning which OSI layer numbers each TCP/IP layer corresponds to.
- **High-impact improvement:** An actual two-column side-by-side stack view (OSI's 7 boxes on one side, TCP/IP's 4 boxes on the other, with connecting lines showing which OSI layers map into which TCP/IP layer) — this is the single most clear-cut "the tool doesn't do what its own description says" finding in this entire audit, and fixing it is mostly a layout change, not new logic.
- **Quick win:** At minimum, reuse the OSI Model Explorer's layer numbers/colors (once added) so the "1-2 merge into Network Access" relationship is visually obvious even before the full side-by-side view exists.
- **Wow feature:** The side-by-side comparison view above, with hover/click on either side highlighting its counterpart on the other — this single fix would make the tool's actual behavior finally match its stated purpose.

### NAT flow simulator

- **Strengths:** Correctly models the NAT table as stateful (empty → populated → used for the return path), clear three-party layout (private host / NAT router / public server) via the shared `MiddleboxFlowVisualizer`.
- **Weaknesses:** Only demonstrates basic (one-to-one) source NAT — no PAT/NAT overload (many-to-one, port-based) despite that being the far more common real-world NAT deployment (a home router NATing an entire LAN through one public IP).
- **High-impact improvement:** Extend the scenario (or add a second mode) showing PAT — multiple private hosts sharing one public IP, differentiated only by port, which is what "NAT" means in practice for the vast majority of real networks.
- **Quick win:** A persistent, visible NAT table (not just the "middle box" value swap) showing the private→public mapping accumulate as a real table would in a router — currently the mapping is shown as a single text value, not a table structure.
- **Wow feature:** The PAT extension above, showing 2-3 simultaneous private hosts mapped to different ports on the same public IP — this is the scenario people actually picture when they hear "NAT," and the current one-to-one example doesn't quite deliver on that mental model.

### VPN packet flow

- **Strengths:** Correct encapsulation/encryption framing (ESP, tunnel state idle→active), reuses `MiddleboxFlowVisualizer` well, clean lock emoji as a lightweight visual cue for "this segment is encrypted."
- **Weaknesses:** Doesn't distinguish tunnel mode from transport mode (a genuinely important, commonly confused IPsec distinction this visualizer is well-positioned to teach but currently doesn't address at all).
- **High-impact improvement:** A tunnel-mode-vs-transport-mode toggle showing the different encapsulation result (transport mode only encrypts the payload, keeping the original IP header; tunnel mode wraps the whole original packet) — directly addresses one of the most common IPsec points of confusion.
- **Quick win:** Cross-link to the VPN Tunnel Overhead calculator (the encapsulation shown here is exactly what that calculator's byte-overhead figures represent) — currently no connection between a visualizer and the tool whose numbers it's literally illustrating.
- **Wow feature:** The tunnel-vs-transport-mode toggle above is strong enough to stand alone as the wow feature here — it's specific, accurate, and fills a real, common gap in understanding.

### Routing decision simulator

- **Strengths:** Correctly models the two-stage decision (all matches → LPM → AD tiebreak), narratively clear.
- **Weaknesses:** Name overlap with Route Lookup Simulator (cross-cutting #4) — nearly indistinguishable names for a visualizer vs. a tool covering the same core idea.
- **High-impact improvement:** Rename for clarity (e.g. "Routing decision walkthrough") and add an explicit link from Route Lookup Simulator ("watch this decided step-by-step →") so the relationship between the fixed-example visualizer and the configurable tool is discoverable rather than accidental.
- **Quick win:** None beyond the rename/cross-link — the underlying `EliminationVisualizer` execution is already solid.
- **Wow feature:** Not a strong candidate for a novel visual here — the `EliminationVisualizer` pattern is already well-suited to this content; effort is better spent on disambiguation than a new visual.

### BGP best path selection

- **Strengths:** Good three-path example, correctly demonstrates weight-then-local-preference as the first two tie-breaks in the real BGP decision order.
- **Weaknesses:** Only covers 2 of BGP's ~10-step tie-break process (weight, local preference) — the adjacent BGP route visualizer _tool_ models the full order, but this _visualizer_ stops after two steps, understating how deep BGP's actual algorithm goes.
- **High-impact improvement:** Extend the walkthrough through at least AS-path length and origin type (the next two most commonly-relevant tie-breaks) so the visualizer's scope is a genuine subset preview of the full tool, not an implicitly-complete-looking 2-step story.
- **Quick win:** A visible "2 of ~10 BGP tie-break steps shown — see the full decision order in BGP route visualizer →" note, so the visualizer doesn't implicitly misrepresent BGP's actual complexity while the extended version is being built.
- **Wow feature:** Once extended, the same "highlight the deciding attribute" idea proposed for the BGP tool above, applied here as a live, animated version of it.

### OSPF SPF animation

- **Strengths:** The best visualizer on the site by a clear margin — an actual SVG topology diagram with live node/edge coloring as Dijkstra's algorithm runs, hand-verified against an independent implementation (per the code's own comment), and a genuinely well-chosen example topology that demonstrates _why_ the algorithm needs to explore alternatives (the direct link isn't always shortest).
- **Weaknesses:** Fixed 5-router topology only — can't add/remove routers or change link costs, so once you've watched it once there's no reason to return.
- **High-impact improvement:** Make the topology editable — add/remove nodes, drag to reposition, edit link costs — turning this from "watch a fixed example" into an actual OSPF SPF sandbox. This is simultaneously the best-executed visualizer and the one where "let the user bring their own scenario" (cross-cutting #3) would have the highest payoff, since the SVG rendering logic already handles arbitrary node/edge data.
- **Quick win:** A "randomize topology" button even without full editability — regenerates a new small graph and re-runs the algorithm, giving a reason to replay without requiring full editor UI.
- **Wow feature:** Full topology editing (click to add a router, drag between two routers to add a link with a cost, then hit "compute SPF") — this single visualizer is the strongest candidate on the entire site for graduating from "visualizer" to genuine "simulator," and the underlying SVG/Dijkstra logic is already most of the way there.

---

## Summary of category-level interactivity

A rough read of how much genuine interactivity (beyond "type a value, see a result") exists per category, based on the above:

- **IP tools**: highest — binary breakdowns, classification, VLSM, multi-mode tools.
- **VPN tools**: low — uniform numeric-in/numeric-out, one preset tool.
- **Routing**: medium — editable route/candidate tables with live tiebreak traces.
- **Switching**: low-medium — STP's prose exceeds its calculator's actual scope.
- **Protocols**: lowest — 6 of 8 are static reference tables with zero input.
- **Security**: medium-high — Certificate viewer and JWT tools are genuinely sophisticated; copy buttons are the most glaring universal gap.
- **Utilities**: medium — Regex tester is the engineering high-water mark of the entire site; formatters lack syntax highlighting.
- **Visualizers**: medium — strong shared accessibility foundation, one standout (OSPF), all fixed-scenario by design.

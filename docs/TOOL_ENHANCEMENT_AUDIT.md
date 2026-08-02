# PacketNova Tool Enhancement Audit

A fresh, from-the-code audit of all 48 live tools, conducted **after** the two prior enhancement tracks in `ROADMAP.md` — "Tool & Visualizer Excellence" (`T1`-`T10`) and "Experience & Identity" (`E1`-`E10`) — had already shipped. That earlier work (`docs/TOOL_VISUALIZER_AUDIT.md`) is now stale in many places: copy-to-clipboard, `DataTable` search, byte-level diagrams, the JWT tool merge, the two naming-collision fixes, several "wow features," and a real expert-mode pattern all landed since. This document re-audits every tool against the **current** code, explicitly marking what's now FIXED vs. STILL OPEN, and surfaces new findings the original audit couldn't have made because the features it's commenting on didn't exist yet.

Companion to `TOOL_ENHANCEMENT_ROADMAP.md`, which turns these findings into ten sequenced milestones plus a final prioritization.

Scope: the 48 tools under Tools (IP, VPN, Routing, Switching, Protocols, Security, Utilities) as listed in `src/content/reference/tools.ts`. Visualizers, the Scenario Simulator, and the Network Journey are out of scope by the user's explicit request — this is about making the existing 48 _tools_ exceptional, not adding new categories.

---

## Cross-cutting findings

Properties of shared infrastructure that explain patterns repeating across many tools below.

1. **Copy-to-clipboard is now the default, not the gap.** `ResultRow` (`src/features/tools/ResultRow.tsx`) bakes a `CopyButton` into every row; `CopyableTextarea` covers every formatter/encoder output. This closes the single biggest complaint in the old audit for roughly 45 of 48 tools. **Three genuine holdouts remain with zero copy affordance of any kind**: Regex tester, ASCII converter, Text diff viewer (all Utilities). **`DataTable` rows still have no per-cell/per-row copy** — the 6 pure-reference Protocol tables plus Administrative Distance reference still can't copy a single looked-up value.
2. **`DataTable` search/filter is fixed sitewide.** Every reference table (UDP, ICMP, DNS, HTTP, TLS, DHCP, Administrative Distance, TCP/IP/Metric comparison's protocol table) now has a live search input with an `aria-live` match-count line.
3. **Both T10 naming collisions are fixed.** "BGP route visualizer" → **"BGP path comparison"**, disambiguated from the BGP best-path _visualizer_. The routing-decision visualizer was renamed **"Next-hop selection"**, disambiguating it from **Route lookup simulator** (the tool).
4. **The JWT decoder/inspector merge shipped exactly as recommended** — one tool, one input, a raw/summary `Pill` toggle, explicit code comment documenting the merge.
5. **Presets still barely exist.** VPN Tunnel Overhead calculator remains the _only_ tool with real preset buttons. MTU, Latency, VLAN ID, PCP, bridge priority, and OSPF reference-bandwidth are all still bare numeric inputs, despite each being an old-audit-flagged, still-open quick win.
6. **`related` cross-links (the `ToolPageLayout`/`ReferencePageLayout` `related` prop) are almost entirely unused.** Confirmed instances across all 48 tools: the MTU↔MSS↔Fragmentation triangle, one inline `<Link>` from IP Header Explorer's Fragment Offset row to the Fragmentation calculator, and TLS Version Explorer → TLS handshake visualizer. That's it. The mechanism exists, works, and is proven — it's just not populated almost anywhere else, even for obviously adjacent pairs (CIDR↔Subnet↔Network Address↔Broadcast↔Wildcard Mask; VLAN calculator↔802.1Q explorer; MAC lookup↔MAC formatter; Hash generator↔Hash verifier; DHCP options reference↔the DHCP DORA visualizer that already exists).
7. **A real, standardized "educational layer" does not exist anywhere.** No tool has a structured "How it works / When to use this / Common mistakes / Troubleshooting tips / Related tools-visualizers-blog" block. Individual pieces exist unevenly — a strong `Aside` here, a `GuidedMode` closing note there — but nothing is systematic, and most tools (all of Security, all of Utilities, most of IP tools) have none of it at all.
8. **`GuidedMode` (built on `useStepPlayer`) is proven but narrowly adopted** — exactly 4 tools use it: Subnet calculator (VLSM branch only), Route summarizer, MTU calculator, BGP path comparison.
9. **`RfcFootnote` is proven but scoped almost entirely to Protocols** — 6 of 8 Protocols tools use it (plus DNS and TLS cite RFCs via a per-row column instead). Zero adoption anywhere in IP, VPN, Switching, Security, Utilities, or most of Routing, despite equally citable standards existing for nearly every one of them (RFC 1918/4632 for IP tools, RFC 4271 for BGP, IEEE 802.1Q for VLAN/802.1Q tools, RFC 4226/6238-adjacent content for Security, etc.).
10. **The T9 "expert mode" pattern (`Pill` toggle + CLI/vendor snippet) is proven in exactly 4 tools** — Subnet calculator, VLAN calculator, STP overview, and TCP header explorer's full builder — plus Administrative Distance reference's Cisco/Juniper comparison table. Every one of these is well-received, all-Cisco-only (bar AD reference's dual-vendor table), and not yet extended to the ~44 other tools where an engineer would expect it.
11. **`TopologyCanvas`/`DeviceIcons` (E6's shared diagram primitive) is proven exactly once in the Tools section** — STP overview's fixed 4-switch example. It's immediately reusable for LPM/Route lookup's overlap diagrams, a VLAN trunk-diagram retrofit, and STP's own still-static editable bridge list, but nothing has claimed it yet.
12. **`BitFieldDiagram` and `BitToggleSandbox` are each used exactly once.** `BitFieldDiagram` only in the 802.1Q tag explorer; `BitToggleSandbox` only in CIDR calculator and Base converter. Both are cheap, working, and under-reused.
13. **`HeaderByteDiagram` covers TCP/UDP/IP header explorers but is static** — it renders field _names_, not the live values a user actually builds in TCP explorer's expert-mode header builder. The diagram and the calculator sit side by side without actually being wired together.
14. **The Scenario Simulator (E7) already embeds several tools** (LPM simulator, Route lookup simulator, Administrative Distance reference, VLAN calculator, 802.1Q explorer, BGP path comparison) into guided narratives — but none of those tools' _standalone_ pages link back to the scenario that features them, so a visitor who lands directly on the tool has no way to discover it.
15. **Two new security gaps, not in the original audit because the surrounding features didn't exist yet:** JWT decoder never flags `alg: "none"` or other dangerous/weak algorithm headers — a well-known, real JWT vulnerability class — despite the tool already being security-framed. Certificate viewer recognizes `sha1WithRSAEncryption` as a signature algorithm but never flags it (or any weak signature algorithm) as deprecated/insecure.

---

# Part 1 — Tool-by-Tool Audit

## IP Tools (8)

### CIDR calculator

- **Strengths:** Full breakdown (network/broadcast/mask/wildcard/usable range/counts) + RFC-cited classification ("Private use (RFC 1918)") + `BinaryBreakdown` with the network/host boundary colored + `AddressSpaceBar` + a live `BitToggleSandbox` — toggle a bit and the input, every downstream value, and the address-space marker all recompute together. The best-executed IP tool on the site.
- **Weaknesses:** Old "no copy buttons" and "no address-space visual" — both **FIXED**. Old wow-feature ask (bit-toggle sandbox) — **FIXED**, and it's the strongest interactive feature in the category. Still open: no way to see this block's position within its _parent_ aggregate (only its own internal network/usable/broadcast split); no `Aside`/practical-implication text beyond the one-line classification.
- **Info to add:** RFC 4632 (CIDR itself, still uncited); the classless-vs-classful history that gives "CIDR" its name.
- **UX improvements:** An explicit "reset to typed value" affordance once a bit's been toggled away from the original input.
- **Interactive improvements:** A second, dimmed bar showing the parent /16 or /8 this block sits inside, so toggling a bit can visibly demonstrate supernetting, not just intra-block position.
- **Educational improvements:** No "How it works"/"When to use this"/"Common mistakes"/"Related tools" — zero `related` links to Subnet, Network Address, or Wildcard Mask calculators despite obvious adjacency.
- **Professional features:** No CLI/vendor snippet, unlike Subnet calculator right next to it in the same category.
- **Wow feature:** Extend the bit-toggle sandbox's `AddressSpaceBar` with a second, dimmed parent-aggregate bar — toggling a bit becomes a supernetting demonstration, not just an intra-block one.

### Subnet calculator (equal split + VLSM)

- **Strengths:** Two real modes. VLSM rows show live spare-capacity ("X spare") inline — directly fixes the old "no efficiency signal" complaint. `GuidedMode` walks VLSM allocation in real largest-first processing order with a per-step progress bar. Cisco IOS CLI snippet generator for both modes behind an expert-mode toggle.
- **Weaknesses:** Old "no efficiency signal" — **FIXED**. Old "no CSV/copy-all" — **STILL OPEN**: results tables are plain `<table>`s with zero `CopyButton`/export. Old "no drag-to-reorder" — moot now that `GuidedMode` shows real processing order. Equal-split mode has no guided walkthrough at all (only VLSM does), and its `BinaryBreakdown` doesn't extend into per-subnet rows.
- **Info to add:** RFC 3021 (point-to-point /31s) is only in code comments, never surfaced in the UI.
- **UX improvements:** Required-name enforcement on VLSM labels (currently silently falls back to "Unnamed subnet").
- **Interactive improvements:** A live rectangle block-diagram of the base network subdividing into labeled, proportionally-sized VLSM chunks as you type — the original wow-feature ask, still unbuilt; `GuidedMode`'s progress bar is a 1-D substitute, not the visual allocation view.
- **Educational improvements:** No "common mistakes" beyond a generic error string; no `related` link to Route Summarizer despite VLSM output being exactly what that tool consumes.
- **Professional features:** CLI snippet is genuinely ahead of the category already.
- **Wow feature:** The still-unbuilt visual block-diagram allocation view — the single highest-value unbuilt idea left in IP tools.

### IPv6 calculator

- **Strengths:** Expand/compress/classify with BigInt-correct 128-bit math; smart first-5/gap/last-5 subnet preview; a genuine **EUI-64/SLAAC generator** (correct modified-EUI-64: MAC split, `fffe` insertion, U/L bit flip), gated to exactly `/64`; per-hextet click-to-expand binary breakdown.
- **Weaknesses:** Old #1 ask, EUI-64/SLAAC generator — **FIXED**, matches the original spec exactly. Old "no solicited-node multicast derivation" — **STILL OPEN**. Old "classification list shorter than IPv4's" — **partially improved, still true**: 9 categories vs. IPv4's 16 (no 6to4, Teredo, NAT64 `64:ff9b::/96`, or multicast-scope breakdown).
- **Info to add:** RFC 4291 (addressing architecture), RFC 7136 (interface ID meaning), RFC 4941 (privacy extensions — directly relevant now that EUI-64 exists, since privacy extensions are the reason real SLAAC addresses often _aren't_ EUI-64).
- **UX improvements:** EUI-64 section already correctly disables outside /64 with a clear inline reason — good defensive UX, no change needed.
- **Interactive improvements:** Per-hextet breakdown doesn't reuse `BitFieldDiagram`, which would render the unequal-width global-routing-prefix/subnet-ID/interface-ID structure far better than raw hextets.
- **Educational improvements:** Zero explanatory prose anywhere on the page — unusual for a page this information-dense, and a real gap versus VPN tools' consistent `Aside` usage.
- **Professional features:** EUI-64 generator is the professional feature; still missing NAT64/6to4/Teredo recognition a working IPv6 engineer would expect.
- **Wow feature:** A true "anatomy of an address" diagram via `BitFieldDiagram` — global routing prefix / subnet ID / interface ID as colored, labeled segments — still the single most valuable unbuilt visual in IP tools.

### Wildcard mask calculator

- **Strengths:** Accepts a mask or bare prefix length. Now has a real `Aside` explaining the ACL/OSPF use case ("0 = must match, 1 = don't care") with a specific warning about pasting a subnet mask by mistake.
- **Weaknesses:** Old "no explanation of when to use this" — **FIXED**. Old "no binary breakdown, trivial quick win" — **STILL OPEN and now the most stale unfixed item in IP tools** — this is the _only_ IP tool with zero `BinaryBreakdown`, despite being explicitly the clearest binary-education opportunity (inverted bits) in the category.
- **Info to add:** No RFC citation (the `Aside` names OSPF but doesn't cite RFC 2328).
- **UX improvements:** Thin page — 3 `ResultRow`s and one paragraph, nothing else.
- **Interactive improvements:** None — no `BinaryBreakdown`, no `BitToggleSandbox`.
- **Educational improvements:** Strongest "when to use this" content in IP tools now, via the `Aside`; still no "common mistakes" beyond one sentence, no "related tools" link.
- **Professional features:** No ACL/OSPF CLI snippet despite the `Aside` naming both use cases by name — a natural, easy addition (`access-list ... 0.0.0.255` / `network 10.0.0.0 0.0.0.255 area 0`).
- **Wow feature:** Side-by-side subnet-mask-vs-wildcard-mask `BinaryBreakdown` with inverted bits visually flagged — the original ask, still unbuilt, and trivial now since `BinaryBreakdown` already exists.

### IP range calculator

- **Strengths:** Correct greedy CIDR-decomposition algorithm (shared with Route Summarizer). Now has `RangeBlocksBar` — a real, proportionally-sized colored-segment visual of the decomposed blocks.
- **Weaknesses:** Old "no visual indication of why multiple blocks were needed" — **partially fixed**: `RangeBlocksBar` shows relative sizes but no accompanying "why not one block" text — the alignment _reason_ is still only implied, never stated. Old "no classification of the range" — **STILL OPEN**, no RFC 1918/documentation-block flagging unlike its IP-tools siblings. Old "no copy-all" — **STILL OPEN**.
- **Info to add:** No RFC citation for the alignment/power-of-2 rationale — exactly the kind of content `Aside` exists for, and this tool has zero `Aside` usage.
- **UX improvements:** Minimal validation feedback beyond a generic "start must come before end" error.
- **Interactive improvements:** `RangeBlocksBar` has hover tooltips but no click-to-inspect a block.
- **Educational improvements:** No "how it works" text at all — blocks appear with no explanation of the algorithm that produced that specific count.
- **Professional features:** No CLI snippet; no `related` link to Route Summarizer despite sharing the exact decomposition function.
- **Wow feature:** Ship the "why not one block" `Aside` (cheap, data already exists) paired with per-block classification badges (private/documentation/public) — would make this the most complete range tool in the category.

### Broadcast calculator

- **Strengths:** Distinct focus from Network Address calculator (resolved pre-audit). `BinaryBreakdown` with host bits highlighted. A genuinely good `Aside` distinguishing **directed** vs. **limited** (255.255.255.255) broadcast, cross-referencing Network Address calculator's classification of 255.255.255.255/32 as "Limited broadcast (RFC 8190)."
- **Weaknesses:** Old "did you know" aside — **FIXED**, and it's specific, well-written content. Old "doesn't mention broadcast on modern switched/VLAN networks" — **STILL OPEN**. New: doesn't use `AddressSpaceBar` even though its closest siblings (CIDR, Network Address calculators) both do.
- **Info to add:** RFC 919/922 (the actual originating directed-broadcast RFCs) uncited — only 8190 (limited broadcast) is cited.
- **UX improvements:** None pressing beyond the missing bar.
- **Interactive improvements:** No bit toggle (unlike CIDR calculator).
- **Educational improvements:** One good "did you know"; still no "when to use this"/"common mistakes" — e.g. `no ip directed-broadcast`'s smurf-attack history would be a natural, currently-missing addition.
- **Professional features:** No mention of `no ip directed-broadcast` (the real, Cisco-default-since-12.0 smurf mitigation) — genuinely relevant, currently absent professional content.
- **Wow feature:** Animate the binary breakdown's host bits flipping from the input's actual bits to all-1s — the original ask, still unbuilt; `BinaryBreakdown` is static today.

### Network address calculator

- **Strengths:** Distinct focus from Broadcast calculator (resolved). The **richest classification text in the category** — every one of 16 special ranges in the shared classification table now has a real explanatory sentence with practical implications baked in ("Private use (RFC 1918)... not routable on the public internet without NAT"). Has `AddressSpaceBar` + `BinaryBreakdown`.
- **Weaknesses:** Old "static label, no practical implications" — **FIXED**, thoroughly — this is now the best-cited tool in IP tools. New: despite the richest classification text on the site, it's rendered as a plain `<p>`, not an `Aside` — arguably exactly the content `Aside` was built for.
- **Info to add:** Nothing RFC-wise missing; could add an IANA-registry link/footnote.
- **UX improvements:** `AddressSpaceBar` is present but static — no `currentValue` marker passed, unlike CIDR calculator, which already demonstrates the exact same prop.
- **Interactive improvements:** Wire the marker prop (near-zero effort, the prop already exists on the shared component).
- **Educational improvements:** Genuinely strong "how it works" content already; no `related` link to CIDR or Broadcast calculators despite sharing the exact same classification data.
- **Professional features:** The NAT-requirement framing is itself a solid, already-shipped professional-context addition.
- **Wow feature:** Wire up the already-built `AddressSpaceBar` marker prop — cheapest real improvement available anywhere in IP tools.

### Route summarizer

- **Strengths:** Rare among free tools generally. Now has a **visual merge-map** (input routes → output aggregate, colored chip rows) directly answering the old "no visualization of which inputs merged" complaint. `GuidedMode` steps through each output block with a `BinaryBreakdown` explaining why its prefix length is what it is, closing on an alignment-focused insight.
- **Weaknesses:** Old "no merge visualization" — **FIXED**. Old "no overlap-vs-adjacency distinction" — appears **still open**, nothing in the visible UI text distinguishes true overlap from simple adjacency. Old wow-feature ask (live timeline/bar) — not built as a timeline, though the merge-map + guided binary breakdown is a reasonable, arguably more informative substitute.
- **Info to add:** No RFC citation (RFC 1519/4632, aggregation) anywhere.
- **UX improvements:** Textarea sizing (rows=8) is a good choice for pasting route lists.
- **Interactive improvements:** Merge-map + `GuidedMode` together are the most interactive combination in IP tools after CIDR calculator's bit-toggle sandbox.
- **Educational improvements:** Genuinely good "how it works" closing note; no explicit "common mistakes" (e.g. "why didn't my routes summarize") framing beyond what's implicit in the steps.
- **Professional features:** No CLI snippet (the resulting `ip route`/`network` statements), despite Subnet calculator already having this exact pattern to copy.
- **Wow feature:** A literal number-line/timeline bar showing input ranges visually collapsing into output segments, complementing (not replacing) the merge-map.

---

## VPN Tools (7)

### VPN tunnel overhead calculator

- **Strengths:** Genuinely accurate presets (WireGuard/OpenVPN/IPsec/GRE/Custom) each with a `note` distinguishing fixed vs. approximate overhead. **Now has a full comparison table** — every preset's overhead/effective-MTU/overhead% shown side by side, active row highlighted.
- **Weaknesses:** Old "no comparison view" — **FIXED**, matches the original spec exactly. Old "presets aren't sourced/cited" — **STILL OPEN**: qualitative caveats exist, but zero `RfcFootnote` usage despite this being the component built for exactly this.
- **Info to add:** RFC 2409/4301 (IPsec), RFC 2784/2890 (GRE), the WireGuard whitepaper — none cited.
- **UX improvements:** The comparison table sits below the fold after 3 `ResultRow`s — arguably more informative than the single-preset result and could be promoted.
- **Interactive improvements:** No slider on link MTU; no stacked payload-vs-overhead bar (the original wow-feature ask).
- **Educational improvements:** No `Aside`, no "which protocol would I actually pick" framing despite now having every preset visible together.
- **Professional features:** Accurate approximation framing is itself credible; missing a site-to-site vs. remote-access VPN real-world scenario.
- **Wow feature:** A stacked payload-vs-overhead bar _per row_ of the now-existing comparison table — turns numbers into an instantly-scannable ranking.

### MTU calculator

- **Strengths:** The most fully-developed VPN tool. `GuidedMode` walks MTU→MSS→Fragmentation as one live 3-step chain (reuses the real calc functions, so numbers stay consistent with the standalone tools). A **draggable payload-size slider** (0–9000) drives the result live. `related` links to MSS + Fragmentation. A detailed, realistic `Aside` describing a GRE/IPsec PMTUD black-hole scenario.
- **Weaknesses:** Old "no connection to Fragmentation/MSS" — **FIXED**. Old "no common-MTU presets (Ethernet/PPPoE/IPsec/GRE/jumbo)" — **STILL OPEN** — flagged as one of the most preset-friendly tools on the site and still has zero clickable presets, only static scale labels on the slider.
- **Info to add:** RFC 1191/1981 (Path MTU Discovery) — referenced conceptually in the `Aside`, never cited by number.
- **UX improvements:** The 1500 tick mark is honestly positioned at its real ~16.7% location on the 0-9000 slider, not a fake midpoint — a nice, correct detail worth preserving in any redesign.
- **Interactive improvements:** A visual "does it fit" bar (payload vs. effective MTU, red overflow segment) — the original wow-feature ask, still unbuilt; the slider substitutes but doesn't visualize overflow.
- **Educational improvements:** Best "how it works"/"troubleshooting" content in VPN tools already; still no explicit "common mistakes" list format.
- **Professional features:** The PMTUD black-hole scenario is itself strong enterprise content; missing preset buttons undercuts it since an engineer would expect one-click PPPoE/GRE/IPsec values.
- **Wow feature:** The still-unbuilt "does it fit" visual bar, paired with the slider that already exists.

### MSS calculator

- **Strengths:** Correctly separates IP/TCP overhead, IPv4 (20B) vs IPv6 (40B) header difference. Now **explicitly explains MSS clamping** in prose plus an `Aside` with a specific "small requests work, large transfers hang" VPN scenario. `related` links to MTU + Fragmentation.
- **Weaknesses:** Old "doesn't explain clamping" — **FIXED**, thoroughly. Old "no connection to MTU calculator" — **FIXED** via `related` links (though not a live value-passing chain — each tool independently recomputes rather than sharing state).
- **Info to add:** RFC 9293 §3.7.1 (MSS option) and RFC 1191 (clamping/PMTUD) — described in prose, never formally cited.
- **UX improvements:** No live cross-tool value sync between this and MTU calculator.
- **Interactive improvements:** No slider, no `GuidedMode`, despite having the most story-driven prose in the category.
- **Educational improvements:** Genuinely strong already — best explanatory text-only tool in VPN.
- **Professional features:** The `Aside`'s enterprise/site-to-site framing already reads like real vendor documentation.
- **Wow feature:** Not a strong visual-flourish candidate (correctly, per prior audit); highest-value remaining move is a CLI snippet (`ip tcp adjust-mss <value>` on Cisco) since the tool already sets up the exact professional scenario.

### Bandwidth estimator

- **Strengths:** Correctly separates raw bandwidth from fixed per-packet overhead. A conditional sentence now compares the entered overhead to a 64-byte packet — a small, already-shipped step toward "why smaller packets cost more."
- **Weaknesses:** Old "doesn't explain why smaller packets cost more" — **partially fixed**: the comparison sentence only fires when overhead is under 64 bytes, so for the tool's own defaults it never appears. Old "no live chart of effective bandwidth vs. packet size" — **STILL OPEN**. Old "no packet-size presets" — **STILL OPEN**.
- **Info to add:** No RFC citation; no `related` link to Tunnel Overhead calculator despite covering the same "overhead per packet" subject.
- **UX improvements:** Thin — 3 numeric inputs, 2 result rows, one conditional sentence.
- **Interactive improvements:** Zero — no slider, chart, `Aside`, or `GuidedMode`. The least interactive VPN tool along with Transfer Time.
- **Educational improvements:** No structured sections of any kind.
- **Professional features:** No VoIP-small-packets-vs-bulk-transfer-large-packets real-world framing.
- **Wow feature:** A live chart of effective bandwidth vs. packet size — genuinely rare among free tools and the tool's own math already computes exactly the curve needed; would double as the missing "why" explanation.

### Latency calculator

- **Strengths:** Explicit propagation-delay-only caveat. Sensible 200 km/ms default. **A shipped animated packet-travel visual** — a dot sliding source-to-destination, duration scaled so farther distances visibly take longer, with an honest note that the animation is scaled for visibility, not 1:1 realism.
- **Weaknesses:** Old wow-feature ask (animated packet travel) — **FIXED**, essentially verbatim. Old "no distance presets" — **STILL OPEN**, confirmed no city-pair/route preset data exists anywhere. No `Aside`, no `related` link to Transfer Time or Bandwidth Estimator despite latency directly affecting throughput via the bandwidth-delay product, unmentioned here.
- **Info to add:** No TCP latency-bandwidth-product connection stated, which would meaningfully link this tool to Bandwidth Estimator/Transfer Time.
- **UX improvements:** Confirm the animation's CSS keyframe is gated by `prefers-reduced-motion`/`motion-safe:` at the stylesheet level — this component sits outside the `useStepPlayer` infrastructure that guarantees this elsewhere, so it's worth an explicit accessibility check (see Q9 in `docs/TOOL_ENHANCEMENT_ROADMAP.md`).
- **Interactive improvements:** Animation re-triggers correctly on input change already.
- **Educational improvements:** Good propagation-only caveat; no "common mistakes" (confusing propagation delay with measured ping RTT, which includes processing/queuing); no worked real-world distance example (e.g. NYC↔London ≈ 5,570 km ≈ 28ms) to anchor the abstract km input.
- **Professional features:** No cloud-region-pair framing (e.g. us-east-1↔eu-west-1) despite this being one of the most common professional uses of a latency calculator.
- **Wow feature:** Already shipped (packet-travel animation). Next-best: real-world distance/cloud-region presets, since the visual is done but has no numeric anchor besides a generic default.

### Transfer time calculator

- **Strengths:** Clean, correct duration formatting; the decimal-MB math is intentional and documented (matches how ISPs market Mbps).
- **Weaknesses:** Old "no TCP overhead, inconsistent with Bandwidth Estimator" — **STILL OPEN**, confirmed: `calculateTransferTime` is a pure `seconds = (sizeMB*8)/bandwidthMbps` with no overhead term at all, while `BandwidthEstimator` right next to it explicitly models overhead — an unaddressed inconsistency between two adjacent tools. This is now the **thinnest tool in either audited category** — the only one of 15 VPN/IP-adjacent tools with zero `Aside`, zero `GuidedMode`, zero `related` links, and only 2 `ResultRow`s.
- **Info to add:** No caveat that real transfers rarely sustain 100% of nominal bandwidth.
- **UX improvements:** Two numeric inputs, two result rows — functionally correct but the least developed page audited in this document.
- **Interactive improvements:** None at all.
- **Educational improvements:** Zero explanatory content of any kind.
- **Professional features:** No file-size presets (a 4K movie, a Linux ISO, a DB backup).
- **Wow feature:** A live progress-bar animation scaled to transfer time — still unbuilt, and now the most conspicuous "why doesn't this have one too" gap in VPN tools given Latency's packet-travel and Fragmentation's fragment-peel animations are both already shipped precedents.

### Packet fragmentation calculator

- **Strengths:** Full per-fragment table (payload/total/offset/MF flag), technically accurate to real IPv4 fragmentation (RFC 791's 8-byte offset-unit alignment, header duplication, 65,535-byte ceiling). **A shipped animated visual** — proportionally-sized fragment bars with a staggered "peel" animation sitting above the table. A specific, well-written `Aside` on IPv6's no-in-transit-fragmentation rule and its dual-stack-migration packet-loss implication. `related` links to MTU + MSS.
- **Weaknesses:** Old wow-feature ask (animated peel) — **FIXED**, essentially verbatim including the "peel" framing. Remaining gap: no `GuidedMode` despite being a natural fit, and despite MTU calculator's own `GuidedMode` chain already calling into this tool's exact calculation function.
- **Info to add:** RFC 791 only in a code comment, never surfaced via `RfcFootnote`; RFC 8200 (IPv6 host-only fragmentation) not cited despite the `Aside` describing its exact behavior.
- **UX improvements:** Good top-to-bottom hierarchy (animated bar → detail table → `Aside`) — no change needed.
- **Interactive improvements:** No click-to-inspect an individual fragment bar (tooltip only).
- **Educational improvements:** The IPv6 `Aside` is one of the best-written callouts anywhere in these 15 tools; still no explicit "common mistakes"/"troubleshooting" section beyond it.
- **Professional features:** No DF-flag cross-link to IP Header Explorer (old audit's suggested quick win, still open — `related` only points to MTU/MSS).
- **Wow feature:** Already shipped (animated peel). Next-highest-value: `RfcFootnote` for RFC 791 (near-zero effort) plus the DF-flag cross-link to IP Header Explorer.

---

## Routing (5)

### BGP path comparison

- **Strengths:** Full 11-attribute candidate model, correct RFC 4271 + vendor tie-break order, a real step-by-step elimination trace. Advanced fields (router ID, neighbor IP, route age) collapse behind a "show advanced attributes" `Pill`. **Hovering a trace-step row highlights the exact deciding field on every candidate card**, with eliminated candidates dimmed — an instant, visual "why did this win" answer.
- **Weaknesses:** Old "dense form, no on-ramp" — **FIXED**. Old "highlight the deciding attribute on the winner's card" — **FIXED, and done better than proposed** (hover-linked across all cards, not just the winner). Naming collision — **FIXED**. No RFC citation anywhere despite BGP being a textbook RFC 4271 protocol. No `related`/cross-link to the BGP best-path visualizer or the BGP scenario it's already embedded in.
- **Info to add:** `RfcFootnote` citing RFC 4271, noting vendor-added steps (Weight, local-pref) aren't in the RFC itself. A short eBGP-vs-iBGP glossary aside.
- **UX improvements:** `related` links to the visualizer and scenario page; a "reset to defaults" button.
- **Interactive improvements:** Extend hover-linking to scroll/flash the corresponding input field, not just recolor a label.
- **Educational improvements:** Has a real `GuidedMode` closing note. Missing "when to use this" (learning vs. real troubleshooting), "common mistakes" (e.g. forgetting Weight is Cisco-local and never advertised).
- **Professional features:** No `show ip bgp`/`show bgp`-style CLI output rendering the winning path the way a router would print it — the single most "professional trust" gap for a BGP tool, since BGP troubleshooting is almost entirely CLI-output-reading in practice.
- **Wow feature:** A toggle rendering the winner + trace as literal Cisco IOS-XR / Juniper `show route` output — nothing else free does "paste attributes, get vendor-formatted CLI output."

### Longest prefix match simulator

- **Strengths:** Editable route table, winning row highlighted directly in the results table.
- **Weaknesses:** Old "no inline validation feedback" — **changed, not fixed**: a malformed CIDR now aborts the _entire_ result with one top-level error rather than degrading per-row — no inline red border on the specific bad input. Old "not sorted by prefix length" — **STILL OPEN**, entry order, not match-specificity order.
- **Info to add:** An explicit "LPM always wins regardless of route source" framing line — this tool teaches the single most common routing-table misconception but never states the lesson the way Route Lookup Simulator does with its "Decided by" label.
- **UX improvements:** Sort the matching table by prefix length descending; inline field-level error styling instead of a full-panel abort.
- **Interactive improvements:** A number-line/overlap diagram (destination as a point, routes as bars underneath, winner highlighted) is now cheap to build reusing `TopologyCanvas`'s existing SVG conventions — no longer a from-scratch build.
- **Educational improvements:** No "how it works"/"common mistakes"/"related tools" — despite being embedded in the Subnetting Mistake scenario, the standalone page has zero link back to it or to Route Lookup Simulator.
- **Professional features:** No `show ip route` CLI framing of the result.
- **Wow feature:** The number-line/overlap visual described above — now a much smaller lift than originally scoped since `TopologyCanvas` already exists.

### Route lookup simulator

- **Strengths:** Correctly models the two-stage LPM-then-AD decision with an explicit "Decided by" label. The AD `Select` now shows the numeric distance directly in the visible option text — the old quick win is **FIXED**.
- **Weaknesses:** Old "no free-entry alternative to the dropdown" — **STILL OPEN**. Same "not sorted, no overlap diagram" gap as LPM simulator.
- **Info to add:** A line distinguishing AD (picks _between sources_) from metric (picks _within_ a source) — this tool is uniquely positioned to state it since it's the one place both concepts collide.
- **UX improvements:** Same sort/inline-validation gaps as LPM simulator.
- **Interactive improvements:** No visual AD-tiebreak diagram; still table-only.
- **Educational improvements:** No on-page "how it works"/"related tools," despite being embedded (with AD reference) in the Routing Black Hole scenario — none of that context surfaces on the standalone page.
- **Professional features:** No CLI framing (`show ip route` with the actual `[AD/metric]` bracket notation IOS prints).
- **Wow feature:** A tiny animated two-stage decision tree (LPM branch → AD branch) — explicitly reusable from `EliminationVisualizer`'s pattern and now also buildable from `GuidedMode` (already proven on the BGP tool). The most template-ready unbuilt wow feature in all of Routing.

### Administrative distance reference

- **Strengths:** Old "add search, sort ascending" — **both FIXED**. Genuinely new content beyond the old ask: a **Cisco-vs-Juniper vendor comparison table** inside an `Aside`, correctly noting Juniper's different terminology and real default differences (eBGP/iBGP parity at 170, OSPF-internal/external split).
- **Weaknesses:** Correctly not a strong wow-feature candidate (per prior audit) — still true. Minor: the vendor table is a separate hand-coded `<table>` rather than reusing `DataTable`, an inconsistency though visually fine.
- **Info to add:** A third vendor column (Fortinet/Arista) would round out the comparison (EIGRP is correctly excluded as Cisco-proprietary).
- **UX improvements:** None pressing.
- **Interactive improvements:** N/A by design.
- **Educational improvements:** Has real vendor-difference content already; missing a one-line "why AD exists at all" framing for total newcomers.
- **Professional features:** The comparison table _is_ the professional feature; could add a `show ip protocols`/`show route protocol` CLI snippet showing where AD actually surfaces.
- **Wow feature:** Correctly not a priority — this page should stay simple.

### Metric comparison tool

- **Strengths:** Live OSPF cost calculator paired with a protocol-philosophy reference table. A conditional `Aside` fires specifically when the interface cost floors at 1, explaining the real `auto-cost reference-bandwidth` gotcha — the old audit's suggested quick win, **FIXED**, and framed better (contextual, not generic).
- **Weaknesses:** Old "table and calculator feel bolted together, no worked EIGRP/RIP examples" — **STILL OPEN** — every non-OSPF row remains prose-only, zero live computation. Old "reference-bandwidth presets" — **STILL OPEN**. No `RfcFootnote` despite OSPF cost being a genuine RFC 2328 concept.
- **Info to add:** RFC 2328 citation; a worked EIGRP composite-metric example with fixed illustrative numbers, since the tool's own thesis ("metrics aren't comparable across protocols") is currently demonstrated only for OSPF.
- **UX improvements:** Reference-bandwidth preset buttons (100M/1G/10G/40G) — directly extends the gotcha the tool's own `Aside` already teaches.
- **Interactive improvements:** A visual bar comparing OSPF cost vs. EIGRP composite vs. hop count for one hypothetical link at varying bandwidth — still unbuilt and still the strongest wow-feature candidate.
- **Educational improvements:** Has one contextual `Aside`; missing "common mistakes" (comparing OSPF cost directly to EIGRP metric as if they're the same unit — the tool's whole point, never stated as an explicit mistake to avoid) and a `related` link to AD reference.
- **Professional features:** No `show ip ospf interface` CLI snippet.
- **Wow feature:** The cross-protocol comparison bar — genuinely differentiated since most free calculators don't attempt cross-protocol metric visualization at all.

---

## Switching (5)

### VLAN calculator

- **Strengths:** Old "very thin, no trunk context" — **substantially fixed**: now has a `TrunkDiagram` (PC—untagged—Switch A—tagged trunk—Switch B—untagged—PC) making tagged-vs-untagged concrete, plus a Cisco IOS CLI snippet behind an expert toggle. Correct reserved/normal/extended VLAN ID classification with contextual notes.
- **Weaknesses:** Old "merge with 802.1Q explorer" — **resolved differently**: not merged, but co-embedded in the VLAN Misconfiguration scenario — a valid alternative, but the two standalone pages still have **zero direct cross-link** outside that scenario flow. Old "VLAN ID presets (1, 1002-1005, 4095)" — **STILL OPEN**, plain input despite the classification logic being preset-ready.
- **Info to add:** No IEEE 802.1Q citation anywhere on the page.
- **UX improvements:** Preset buttons for 1/1002-1005/4095 as clickable classification demos; a `related` link to 802.1Q explorer.
- **Interactive improvements:** Retrofit `TrunkDiagram` with the now-existing `TopologyCanvas`/`DeviceIcons` switch glyph for a more literal device look.
- **Educational improvements:** No "how it works"/"common mistakes" (native VLAN mismatch, VLAN 1 hygiene) beyond one note.
- **Professional features:** Cisco IOS CLI present (**FIXED** relative to the old audit's total silence); missing Juniper/Fortinet equivalents.
- **Wow feature:** Retrofit `TrunkDiagram` with real device icons, and show a _second_ VLAN sharing the same trunk link simultaneously to demonstrate tag multiplexing — currently only ever shows one VLAN's frame on the wire at a time.

### 802.1Q tag explorer

- **Strengths:** Old "no binary breakdown despite being the clearest bit-education opportunity" — **fully fixed, exactly as originally proposed**: `BitFieldDiagram` renders PCP(3)/DEI(1)/VLAN ID(12) as colored, unequal-width, labeled, live-updating bit segments.
- **Weaknesses:** Old "PCP preset labels (0=Best Effort, 5=Voice, per 802.1p)" — **STILL OPEN**, PCP remains a bare 0-7 input. No expert-mode toggle, `Aside`, RFC/IEEE citation, or cross-link to VLAN calculator.
- **Info to add:** The standard 802.1p PCP priority-to-traffic-class mapping — currently a bare number with zero attached meaning.
- **UX improvements:** A PCP `Select` with named priority levels instead of a raw number input.
- **Interactive improvements:** Hover a field in `BitFieldDiagram` to highlight its corresponding input, mirroring the BGP tool's hover-linking pattern.
- **Educational improvements:** Zero prose beyond the description line — no "how it works," "when to use this" (voice VLANs, QoS trust boundaries), "common mistakes" (forgetting native-VLAN frames are untagged on the wire).
- **Professional features:** No CLI (`switchport priority extend`, `mls qos trust cos`) despite PCP/CoS being directly configurable.
- **Wow feature:** A live "frame on the wire" byte diagram (extending `HeaderByteDiagram`'s grammar to Ethernet's DA/SA/TPID/TCI/EtherType layout) showing exactly where the 4-byte tag sits between source MAC and EtherType — the tool computes the tag today but never shows it _in context_.

### MAC address lookup

- **Strengths:** Old "unrecognized OUI is a dead end" — **FIXED**: the result panel unconditionally shows OUI/NIC split, multicast bit, and locally-administered bit regardless of whether the vendor is recognized. Honest, prominent caveat about the small reference set. Binary breakdown available via a `Pill` toggle.
- **Weaknesses:** Old "expand the reference set" — **STILL WIDE OPEN, and smaller than the old audit implied** — exactly **5 entries** (Cisco, VMware×2, Raspberry Pi×2). Old "suggest IEEE's public OUI search as a fallback" — **STILL OPEN**, no such link exists anywhere.
- **Info to add:** A direct link to IEEE's public OUI/MA-L search as the explicit fallback for unrecognized vendors.
- **UX improvements:** None urgent otherwise.
- **Interactive improvements:** No bit-click toggle (`BitToggleSandbox` exists sitewide but isn't wired in).
- **Educational improvements:** No "how it works" (what OUI registration means), "common mistakes" (assuming locally-administered always means VM — true for VMware here, not universal), or `related` link to MAC formatter.
- **Professional features:** No `show mac address-table` CLI framing.
- **Wow feature:** Expanding the OUI set to a few hundred common vendors (Apple, Intel, Dell, HP, Ubiquiti, TP-Link, etc.) is the single highest-leverage, lowest-engineering-risk "wow" in this entire audit — a content investment, not a feature build, that directly fixes the tool's most visible limitation.

### MAC formatter

- **Strengths:** Old "confirm format-agnostic parsing" — **confirmed true** (strips separators before validating 12 hex digits, genuinely accepts colon/hyphen/dot/bare-hex interchangeably). Old "no copy buttons, single most obvious gap on the site" — **FIXED** on all three output formats.
- **Weaknesses:** Old "echo back 'detected: Cisco dotted format' as a trust-building touch" — **STILL OPEN**, input format is silently accepted with no feedback about what was detected.
- **Info to add:** Nothing significant missing — appropriately minimal.
- **UX improvements:** The "detected format" echo.
- **Interactive improvements:** Same `MacBinaryBreakdown` toggle as MAC lookup — consistent, fine as-is.
- **Educational improvements:** Zero prose on the page — a one-line note on _why_ three formats exist (Cisco IOS dot notation vs. everything-else colon vs. Windows hyphen) would be free, useful, and currently entirely absent.
- **Professional features:** N/A — correctly scoped narrow.
- **Wow feature:** The "detected format" echo remains the only worthwhile addition.

### STP overview

- **Strengths:** Old "prose describes root/designated/blocked ports but the calculator only computes root bridge" — **fully fixed, and the standout of the whole category**: a real Dijkstra-style shortest-cost-to-root computation runs on a fixed 4-switch ring, correctly assigning root/designated/blocked roles including proper tie-breaking, rendered via `TopologyCanvas` with switch `DeviceIcon`s — root bridge visually enlarged/accented, blocked links dashed and dimmed. This is E6's shared diagram system, the old audit's #1 Switching wow feature, and T9's expert-mode CLI snippet all landing together. A well-written `Aside` on 802.1D vs. RSTP convergence times.
- **Weaknesses:** The port-role topology diagram only runs on the **fixed example** — the visitor's own editable bridge list still only computes root-bridge election (priority + MAC tiebreak), not port roles. Old "bridge priority presets" — **STILL OPEN**.
- **Info to add:** IEEE 802.1D/802.1w citation, currently only in prose, not a formal footnote.
- **UX improvements:** Bridge priority preset buttons (multiples of 4096, the standard Cisco convention).
- **Interactive improvements:** Extend the live `TopologyCanvas`+algorithm pairing to the visitor's own editable bridge/link list — this is the single highest-leverage remaining gap precisely because the hard part (the algorithm + diagram primitive) is already built and proven on the fixed example.
- **Educational improvements:** Genuinely strong prose plus the worked example; missing "common mistakes" (not tuning priority on the intended core switch, letting STP silently elect an access switch as root) and a `related` link to VLAN calculator.
- **Professional features:** Cisco IOS CLI present; missing PortFast/BPDU Guard mention (a near-universal real-world STP companion) and the RSTP-mode-selection CLI (`spanning-tree mode rapid-pvst`).
- **Wow feature:** Make the _editable_ bridge list drive its own live topology diagram, not just the fixed example — letting a visitor build an arbitrary ring/mesh and watch root/designated/blocked ports recompute live is now a small lift given both pieces already exist and already work together for the fixed case.

---

## Protocols (8)

### TCP header explorer

- **Strengths:** Old "extend to a full header builder" — **fully fixed**: an expert-mode "full header builder" takes source/dest port, seq/ack, window, checksum, urgent pointer plus flags, and renders the complete 20-byte hex header. `HeaderByteDiagram` renders the classic proportional byte diagram above the reference table. A conditional `Aside` computes real max throughput (window÷RTT) at an illustrative 100ms RTT and explains window scaling (RFC 7323) — genuinely rare content among free tools.
- **Weaknesses:** Old "highlight the corresponding table row when a flag is toggled" — **STILL OPEN**, flags checkboxes and the reference table remain visually disconnected.
- **Info to add:** RFC 793/9293 already cited; RFC 7323 (window scaling) is mentioned in the `Aside` but not formally cited alongside it.
- **UX improvements:** Flag↔table row-highlight linking.
- **Interactive improvements:** `HeaderByteDiagram` is currently static (field names only) — wiring the live builder's actual byte values into it would turn "explorer" into a true end-to-end interactive header builder.
- **Educational improvements:** Strong `Aside` already; missing "common mistakes" (misreading Data Offset as a byte count instead of a 32-bit-word count — a classic gotcha this exact field invites) and a `related` link to the TCP handshake visualizer.
- **Professional features:** The expert-mode builder is already genuinely professional-grade; a Wireshark-style annotated hex dump view would be a natural next step.
- **Wow feature:** Wire the live builder's actual values into `HeaderByteDiagram` — closes the one remaining gap between the page's two halves.

### UDP header explorer

- **Strengths:** `HeaderByteDiagram` added (**FIXED**). RFC 768 cited via `RfcFootnote`. Search present.
- **Weaknesses:** Old "purely static, easiest Protocols tool to add a live calculator to" — **STILL OPEN**, confirmed zero interactivity of any kind. Old "TCP vs UDP contrast callout" — **STILL OPEN**.
- **Info to add:** The TCP-vs-UDP contrast line (8 vs. 20+ bytes, no reliability/ordering/flow control) — cheap, high-value, and this is the natural page for it.
- **UX improvements:** None beyond the two gaps above.
- **Interactive improvements:** A tiny live calculator (source/dest port + length → resulting byte layout) — still the lowest-effort meaningful upgrade in all of Protocols, since UDP's header is only 4 fields.
- **Educational improvements:** Zero prose beyond the description line; no "when to use this" (DNS, DHCP, streaming, gaming); no `related` link to TCP header explorer or the UDP-based reference pages (DHCP, DNS).
- **Professional features:** None.
- **Wow feature:** A side-by-side `HeaderByteDiagram` vs. TCP's — both components already exist and take the same shape, so this is a near-zero-effort addition that makes the size difference literally visible.

### IP header explorer

- **Strengths:** Old "cross-link Fragment Offset to Fragmentation calculator" — **FIXED** via an inline `<Link>` embedded directly in that row. `HeaderByteDiagram` + live DF/MF calculator matching TCP's pattern. RFC 791 cited.
- **Weaknesses:** Same flag↔row-highlighting gap as TCP explorer.
- **Info to add:** Nothing major missing — citations and the fragmentation cross-link are already well handled.
- **UX improvements:** Flag↔row highlighting.
- **Interactive improvements:** Same live-value-wiring opportunity into `HeaderByteDiagram` as TCP.
- **Educational improvements:** No "common mistakes" (confusing TTL's purpose with a timer instead of a hop-count safety net); no `related` link to ICMP explorer despite TTL-expiry directly producing an ICMP Time Exceeded message.
- **Professional features:** None (no ACL framing referencing header fields).
- **Wow feature:** Live-value wiring plus: toggling DF live-previews "packet dropped, ICMP Fragmentation Needed sent back" vs. unchecked "packet fragmented" — ties this page, ICMP explorer, and the Fragmentation calculator into one closed loop with almost no new logic.

### ICMP explorer

- **Strengths:** Search added (**FIXED**). RFC 792 cited, with an explicit, accurate note that ICMPv6 (RFC 4443) is a separate spec — more careful scoping than most competitors bother with.
- **Weaknesses:** Old "flat list, type/code relationship not visually grouped" — **STILL OPEN**, still `type | name | description` with no nesting by parent type (Type 3's 16 codes is the canonical example). Old "ping/traceroute mini-narrative" wow feature — **STILL OPEN**.
- **Info to add:** Nothing citation-wise missing.
- **UX improvements:** Group/indent codes under their parent type — the single highest-leverage fix for this page specifically.
- **Interactive improvements:** Zero beyond search.
- **Educational improvements:** No "common mistakes" (blocking ICMP wholesale at the firewall, breaking PMTUD); no `related` link to IP header explorer despite DF+fragmentation directly producing specific ICMP types.
- **Professional features:** No firewall-rule framing (which ICMP types a real enterprise firewall should allow at minimum to avoid breaking PMTUD).
- **Wow feature:** A scenario picker ("host unreachable," "TTL expired," "fragmentation needed" → highlights the matching row) — still unbuilt, and now cheaper given the Scenario page pattern already exists elsewhere as a template.

### DNS record reference

- **Strengths:** Old "add an example column" — **fully fixed**: every record type now has a realistic example plus a per-row RFC citation (SRV correctly cited RFC 2782, CAA RFC 8659, distinct from the generic majority — accurate, non-generic sourcing). Search added. A `ResolutionFlow` component renders a 4-stage Root→TLD→Authoritative→Answer chip flow with an honest caching caveat.
- **Weaknesses:** Old wow feature (type a domain, watch a representative resolution chain, "arguably graduates to Visualizers") — **partially fixed, not fully delivered**: `ResolutionFlow` is static/narrated with fixed generic captions — there's no domain input, so it's never "your" chain.
- **Info to add:** Nothing major — example + RFC columns already close the biggest old gap.
- **UX improvements:** None pressing beyond the interactivity gap.
- **Interactive improvements:** Add a domain-name input that varies `ResolutionFlow`'s captions per stage — the remaining piece of the original wow feature.
- **Educational improvements:** Has real "how it works" content via `ResolutionFlow` already; missing "common mistakes" (TTL too low causing resolver storms, trailing-dot significance, CNAME-at-apex restrictions); no `related` link to DHCP options reference.
- **Professional features:** No `dig`/`nslookup` output framing for any record type — a near-zero-cost addition since example records already exist in the data.
- **Wow feature:** Make `ResolutionFlow` genuinely interactive (typed domain input) — this single change would fully deliver on the "graduates to Visualizers" assessment.

### HTTP status reference

- **Strengths:** Old "group by class with a visible badge" — **fully fixed**: a computed Class column renders a tone-mapped `Badge` per row (1xx neutral, 2xx success, 3xx accent, 4xx warning, 5xx danger). Search added. RFC 9110 cited, correctly noting it obsoletes 7231/2616.
- **Weaknesses:** Old wow feature ("paste a raw HTTP response line, get the matching row highlighted") — **STILL OPEN**.
- **Info to add:** Nothing citation-wise missing.
- **UX improvements:** None pressing — search + class badges close the two biggest old gaps.
- **Interactive improvements:** The paste-and-match lookup mode remains the best unbuilt idea.
- **Educational improvements:** No "common mistakes" (using 404 for auth failures instead of 401/403, or returning 200 with an error body instead of a real 4xx/5xx — genuinely common API-design mistakes this table is positioned to call out); no `related` link to TLS Version Explorer or the security tools.
- **Professional features:** No REST-API-design "use for..." column beyond the existing description.
- **Wow feature:** The "paste my error" lookup mode — now cheaper to build since `DataTable`'s search logic already provides the matching primitive to extend.

### TLS version explorer

- **Strengths:** Old "cross-link to TLS handshake visualizer" — **FIXED**, and this is the **only one of these 18 tools using the `related` prop at all**. Search added. Status column (deprecated/current) already good per prior audit.
- **Weaknesses:** Old "no connection to Certificate viewer or Hash generator" — **STILL OPEN**, only the handshake visualizer is linked. Old "visual timeline instead of table" wow feature — **STILL OPEN**.
- **Info to add:** Nothing citation-wise missing (per-row RFC column present).
- **UX improvements:** Add `related` links to Certificate viewer and Hash generator — mechanical, the prop already does exactly this.
- **Interactive improvements:** None beyond search.
- **Educational improvements:** No "common mistakes" (still allowing TLS 1.0/1.1 for compliance reasons, cipher-suite downgrade attacks).
- **Professional features:** No nginx/Apache TLS-version-pinning config snippet despite being one of the most directly actionable professional tasks this reference could support.
- **Wow feature:** A visual timeline (versions plotted by year with deprecation markers, rows expandable to cipher-suite differences) — still unbuilt and still the single best fit.

### DHCP options reference

- **Strengths:** Search added. RFC 2132 cited.
- **Weaknesses:** Old "no DHCP visualizer anywhere, genuine content gap" — **the gap itself is now FIXED elsewhere**: a DHCP DORA visualizer exists. **But the cross-link is STILL OPEN** — this page has zero `related` entry pointing to it, so the fix is invisible from here.
- **Info to add:** Nothing citation-wise missing.
- **UX improvements:** Add a `related` link to the DHCP DORA visualizer — a one-line, zero-risk fix now that the target exists.
- **Interactive improvements:** Still fully static — reasonably scoped for a numbered-option reference, less urgent than UDP/ICMP's gaps.
- **Educational improvements:** No "how it works" (what DORA stands for, in-page), "common mistakes" (option 82 relay-agent confusion, rogue-DHCP/DHCP-snooping issues).
- **Professional features:** No `ip dhcp pool`/`option` Cisco IOS CLI snippet despite several options (66/150 TFTP server, 43 vendor-specific) being extremely common real-world VoIP/wireless-controller tasks.
- **Wow feature:** The cross-link to the DHCP DORA visualizer is the highest-value, lowest-effort item in this entire audit for this specific page — the actual "wow" already shipped, it's just disconnected from its natural companion page.

---

## Security (7 — JWT decoder/inspector merge confirmed)

### Hash generator

- **Strengths:** MD5 (via `js-md5`) + SHA-1/256/384/512 (native `crypto.subtle`); `SecureContextRequiredError` gives an actionable non-HTTPS message instead of a cryptic failure; a live avalanche-effect diff animation character-flashes changed positions and reports % changed; text and file modes.
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no file-hash progress for large files" — **STILL OPEN** — `isComputing` is just a boolean spinner, no percentage/streaming; the whole file is read via `arrayBuffer()` at once. New: mode-toggle buttons are raw `<button>`s, not the shared `Pill` component used elsewhere — a minor inconsistency.
- **Info to add:** No mention of which algorithms are cryptographically broken (MD5, SHA-1) vs. still acceptable for integrity checks.
- **UX improvements:** Drag-and-drop file zone.
- **Interactive improvements:** The avalanche animation is already a strong, unique element.
- **Educational improvements:** No "how it works," no "when to use this" (checksums vs. passwords — an explicit "hashes ≠ password storage" warning belongs here), no `related` link to Hash verifier.
- **Professional features:** No CLI equivalents shown (`sha256sum`, `Get-FileHash`, `openssl dgst`).
- **Wow feature:** Streaming/chunked file hashing with a real progress bar for multi-GB files — most free hash tools choke silently or freeze on large files; this would be a genuine differentiator.

### Hash verifier

- **Strengths:** Shares `computeHash`/`verifyHash` with Hash generator; case-insensitive, whitespace-trimmed comparison.
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "silent-until-typed UX, no loud match indicator" — **STILL OPEN** — match state is still a plain `ResultRow` "Yes/No" text row, despite this being the tool's entire purpose.
- **Info to add:** Why you'd verify a hash at all (download integrity, tamper detection).
- **UX improvements:** A "paste from clipboard" affordance on the expected-hash field.
- **Interactive improvements:** A big colored pass/fail state is the obvious target.
- **Educational improvements:** No "common mistakes" (comparing a SHA-256 output against an MD5 hash — mismatched case/whitespace is already handled silently but never explained as forgiving).
- **Professional features:** No mention of the single most common real use case (verifying an ISO/installer download against a vendor-published checksum).
- **Wow feature:** A big, unmissable green-check/red-X state filling the result panel, not a table row — cheap, directly closes the flagged gap, and is the correct wow feature for a binary-answer tool.

### JWT decoder

- **Strengths:** Merge confirmed and well-executed — one input, `Pill`-based Raw/Summary toggle; Summary mode has an expiry `Badge`; explicit "not verifying the signature" disclaimer.
- **Weaknesses:** Old "two separate tools, has to guess which to click" — **FIXED**. Old wow-feature suggestion (jwt.io-style colored segments) — **STILL OPEN**. **New, not in the old audit**: the decode logic never flags `alg: "none"` or other dangerous header values — a real, well-known JWT vulnerability class (`alg:none` bypass, RS256→HS256 key confusion) that a security-framed tool currently says nothing about.
- **Info to add:** What `alg`/`typ`/`iat`/`exp`/`nbf` mean for someone unfamiliar with JWTs; that JWTs use base64url, not base64 (a common confusion when decoding manually).
- **UX improvements:** A timestamp formatting toggle (currently ISO-only; no relative "expires in 3 days" or local-timezone display).
- **Interactive improvements:** Per-segment click-to-highlight.
- **Educational improvements:** No "how it works," "common mistakes" (trusting a decoded-but-unverified payload), or `related` link to Base64 tool despite JWT segments literally _being_ base64url.
- **Professional features:** No CLI equivalent; **the missing `alg:none`/weak-algorithm danger warning is the single highest-value security addition missing from this tool.**
- **Wow feature:** Color-coded token segments (header/payload/signature) directly in the input, jwt.io-style, **plus** an inline `alg:none`/weak-algorithm danger banner when detected — combines the old ask with a genuine, currently-absent security check.

### Base64 encode/decode

- **Strengths:** Clean, minimal toggle pattern shared with URL tool; `CopyableTextarea` output (copy present).
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no file-to-Base64 mode" — **STILL OPEN**, text-only. Old wow feature (data-URI image preview) — **STILL OPEN**.
- **Info to add:** Base64 vs. Base64URL distinction — directly relevant given the JWT tool right next door uses the URL-safe variant, currently uncross-referenced.
- **UX improvements:** Drag-and-drop file zone; auto-detect already-encoded input.
- **Interactive improvements:** No live diff/highlight of which characters map to what.
- **Educational improvements:** Nothing — no "how it works" (3-bytes-to-4-chars encoding), "when to use" (data URIs, email attachments, embedding binary in JSON/XML), or **"Base64 is encoding, not encryption"** — a real and important misconception for a security-categorized tool to correct, currently absent.
- **Professional features:** No CLI equivalents (`base64`, `certutil -encode`); the "not encryption" caveat is a real security best-practice note that belongs here and is missing.
- **Wow feature:** Live data-URI image preview when decoded/encoded content looks like `data:image/...` — cheap, delightful, and still the original unbuilt suggestion.

### URL encode/decode

- **Strengths:** Same clean, consistent mode-toggle pattern; correct percent-encoding.
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no highlighting of which characters changed" — **STILL OPEN**, plain before/after text despite `TextDiffViewer`'s diff-color infrastructure existing in the same category and being directly reusable.
- **Info to add:** `encodeURIComponent` vs. `encodeURI` distinction; which characters are reserved/unreserved per RFC 3986.
- **UX improvements:** None beyond the missing highlighting.
- **Interactive improvements:** None.
- **Educational improvements:** No "how it works," "when to use" (query strings vs. path segments encode differently — a real, commonly-hit gotcha), or `related` link to the diff viewer or Base64 tool.
- **Professional features:** No CLI equivalent (`curl --data-urlencode`, Python `urllib.parse.quote`).
- **Wow feature:** Character-level highlight of exactly which characters were transformed, reusing `TextDiffViewer`'s color treatment — still the single best fit here.

### Certificate viewer

- **Strengths:** **A major upgrade since the old audit** — now genuinely parses full PEM chains, with `Pill`-based navigation labeled by role (Leaf/Intermediate N/Root CA/Issuer, with self-signed detection); validity `Badge`s; `CopyButton` now on the serial number and every SAN.
- **Weaknesses:** Old "no copy buttons" — **FIXED**. Old "no chain support, single cert only" — **FIXED, shipped essentially as the old audit's own top ask**. Old wow-feature suggestion (validity timeline bar) — **STILL OPEN**. **New finding**: the parser recognizes `sha1WithRSAEncryption` as a signature-algorithm OID but nothing in the UI flags SHA-1-signed (or otherwise weak/deprecated) signature algorithms as a real, current security concern.
- **Info to add:** What SANs are for; a weak-signature-algorithm warning (see above); key-size/algorithm strength commentary (RSA-2048 vs. 4096, ECDSA curve).
- **UX improvements:** Drag-and-drop `.pem`/`.crt` file upload — a plausible real workflow currently unsupported.
- **Interactive improvements:** Chain navigation via `Pill`s is already good; no visual chain diagram (leaf→intermediate→root arrows).
- **Educational improvements:** No "how it works" (X.509/ASN.1 basics), "common mistakes" (forgetting to include intermediates causes many real TLS failures — directly relevant now that chains are supported), or `related` links to TLS handshake visualizer/TLS version explorer/Hash generator.
- **Professional features:** No CLI equivalent (`openssl x509 -text -noout`); no weak-signature warning as above; no explicit warning when a submitted chain is missing an intermediate.
- **Wow feature:** The validity-lifetime timeline bar (not-before→not-after, "today" marker, remaining-days readout) — still the strongest and cheapest available wow feature, now paired with a weak-signature-algorithm danger banner for real security value.

### Password generator

- **Strengths:** **Entropy bar shipped** — a live 5-tier strength bar updates _before_ generating, matching the original wow-feature ask exactly. CSPRNG via `crypto.getRandomValues` with an explicit code comment noting this is a real security requirement. Double-computation bug fixed via `useMemo` + regeneration nonce.
- **Weaknesses:** Old "double computation" — **FIXED**. Old "no entropy indicator" — **FIXED**. Old "no copy button" — **FIXED**. **New findings:** no "exclude ambiguous characters" option (0/O, l/1/I) — standard on competing generators, absent here; the symbol charset is a small fixed 18-character set with no way to customize/expand; length is a free-text input, not a slider, despite entropy already being computed live off it.
- **Info to add:** What "bits of entropy" means and how it translates to crack time (e.g., "~3 trillion years at 1B guesses/sec").
- **UX improvements:** A length slider wired to the existing entropy bar.
- **Interactive improvements:** The slider above would make the existing entropy feature feel materially more interactive with almost no new logic.
- **Educational improvements:** No "common mistakes" (reusing generated passwords, storing them insecurely), "when to use" (per-service unique passwords + a password manager), or `related` link to Hash generator/verifier.
- **Professional features:** No CLI equivalent (`openssl rand -base64`, `pwgen`); the CSPRNG trust statement exists in a code comment but could be surfaced to the user directly.
- **Wow feature:** A length slider wired live to the already-shipped entropy bar — cheap, high-perceived-value.

---

## Utilities (8)

### Regex tester

- **Strengths:** Still the most technically sophisticated tool on the site — Web Worker evaluation with a 750ms hard timeout against catastrophic backtracking/ReDoS, 150ms debounce, a 10,000-match safety cap, live highlighted matches, and a real **capture-group breakdown panel** (each numbered group per match, including explicit "did not participate" for non-participating optional groups).
- **Weaknesses:** Old "no capture-group breakdown" — **FIXED**, and genuinely well-built beyond what the old audit saw. Old "no cheat-sheet" — **STILL OPEN**. **Still open, newly confirmed:** named capture groups (`(?<name>...)`) are never surfaced anywhere, even though JS's native `match.groups` would provide them almost for free. **New gap:** zero copy affordance anywhere in this tool — one of only three tools sitewide with none at all.
- **Info to add:** An explanation of flags (`g`/`i`/`m`/`s`/`u`/`y`) — the flags input is a bare text box with no legend.
- **UX improvements:** Visual flag checkboxes instead of free-text; named-group labels in the breakdown instead of falling back to numeric-only.
- **Interactive improvements:** Click a match to scroll/focus it; syntax-highlight the pattern itself.
- **Educational improvements:** No "how it works," "common mistakes" (greedy vs. lazy, unescaped special characters), cheat-sheet, or `related` link — under-taught relative to how sophisticated the engineering actually is.
- **Professional features:** No CLI/language-equivalent export (`grep -E`, `sed`, a JS/Python snippet) — technically easy given the pattern/flags are already in state, and high value.
- **Wow feature:** Named-capture-group support (cheap, `match.groups` is native) plus a plain-English pattern explainer ("one or more digits, then a literal space") — still the single best differentiator available given the Worker architecture already handles safe evaluation.

### JSON formatter

- **Strengths:** Clean pretty/minify toggle, real parse-error surfacing, `CopyableTextarea` output.
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no syntax highlighting" — **STILL OPEN** — plain monospace `<textarea>`, no color for keys/strings/numbers/booleans, still the most conspicuous gap versus every competing free JSON formatter.
- **Info to add:** Confirm the surfaced parse-error message includes line/column, not just the raw `JSON.parse` text.
- **UX improvements:** A "load example" action; drag-and-drop of a `.json` file.
- **Interactive improvements:** Collapsible/foldable object and array nodes — the biggest interactive gap in Utilities given how much room there is.
- **Educational improvements:** No "how it works," "common mistakes" (trailing commas, single quotes, unquoted keys — the most common reasons someone lands here with an error), or `related` link to YAML/XML formatters (YAML interconverts, XML doesn't — that link is entirely absent both directions).
- **Professional features:** No CLI equivalent (`jq`, `python -m json.tool`); no minify-size-savings stat.
- **Wow feature:** Since `CopyableTextarea` is a plain textarea, it structurally can't render colored spans — swapping to a lightweight syntax-highlighted, foldable read-only view would close two old-audit gaps at once and is the single highest-leverage upgrade in all of Utilities.

### YAML formatter

- **Strengths:** Old "no YAML↔JSON conversion, the real wow feature" — **fully fixed and shipped exactly as recommended**: three real `Pill`-toggled modes (Format / YAML→JSON / JSON→YAML).
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no syntax highlighting" — **STILL OPEN**. New: switching modes doesn't live-convert your _current_ edits between YAML and JSON text boxes — each mode keeps separate state, so mode-switching mid-edit silently reverts to a default rather than converting what you had.
- **Info to add:** YAML gotchas (significant whitespace, `yes`/`no`/`on`/`off` boolean coercion, the "Norway problem") — genuinely useful, YAML-specific trivia this tool is well-positioned to surface.
- **UX improvements:** Fix the mode-switch state-carryover gap described above.
- **Interactive improvements:** None beyond the mode switch.
- **Educational improvements:** No "how it works," "common mistakes" (the boolean-coercion note above fits perfectly here), or `related` link to JSON formatter despite direct interconversion.
- **Professional features:** No CLI equivalent (`yq`); no Kubernetes-manifest/CI-config/Ansible real-world framing.
- **Wow feature:** Since YAML↔JSON is shipped, the next-best move is a live side-by-side split view (YAML left, JSON right, both updating as you type either side) rather than a single-pane mode toggle.

### XML formatter

- **Strengths:** Correct formatting/validation for a format that's genuinely fiddly to hand-indent; `CopyableTextarea` output.
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no syntax highlighting" — **STILL OPEN**. This is the thinnest formatter — single textarea in, single textarea out, no mode toggle at all, unlike every sibling formatter.
- **Info to add:** Namespaces, self-closing tags, CDATA handling, or common malformed-XML causes (unescaped `&`, mismatched tags) — none mentioned.
- **UX improvements:** An XML↔JSON conversion mode would match the parity YAML just gained (config migration, SOAP/REST bridging are plausible real needs).
- **Interactive improvements:** None.
- **Educational improvements:** No "how it works," "common mistakes" (the escaping/malformed-tag points above), or `related` link.
- **Professional features:** No CLI equivalent (`xmllint --format`); no SOAP-API/legacy-config/RSS-feed real-world framing.
- **Wow feature:** Tag/attribute/text-content syntax highlighting is the correctly-scoped ask here (narrower use case than JSON/YAML on a networking site) — not a conversion mode.

### Epoch converter

- **Strengths:** Bidirectional (epoch→date / date→epoch), seconds/milliseconds toggle, sensible "now" defaults on load, copy present.
- **Weaknesses:** Old "no copy button" — **FIXED**. Old "no timezone selector, UTC/ISO only" — **STILL OPEN**. Old "no 'now' snap button" — **STILL OPEN**, confirmed — only the very first render seeds "now," with no way to reset to the current timestamp afterward.
- **Info to add:** The year-2038 problem (32-bit epoch overflow) — a genuinely relevant, teachable, currently absent fact for exactly this tool.
- **UX improvements:** A "now" button — a one-line fix, still unbuilt.
- **Interactive improvements:** A relative-time readout ("3 days ago") — cheap, high-value, still absent.
- **Educational improvements:** No "how it works" (epoch = seconds since 1970-01-01 UTC), "common mistakes" (seconds-vs-milliseconds confusion — the unit toggle exists but nothing sanity-checks a value that looks off by 1000x), or `related` link.
- **Professional features:** No CLI equivalents (`date -d @epoch`, `Get-Date`); no log-analysis real-world framing despite epoch timestamps being ubiquitous in logs/APIs.
- **Wow feature:** The relative-time readout, paired with a magnitude-sanity-check warning that catches the classic ms-vs-s mistake.

### Binary/decimal/hex converter

- **Strengths:** All four bases (binary/octal/decimal/hex) computed at once. **Bit-toggle sandbox shipped** — click any bit, every base recomputes live, correctly capped at 32-bit. A hideable custom-base (2–36) expert section is a genuinely new addition beyond the old audit's original scope.
- **Weaknesses:** Old "no copy buttons" — **FIXED**. Old wow-feature suggestion (clickable bit grid) — **FIXED**, shipped essentially as proposed.
- **Info to add:** An explanatory note for standard bases (why hex maps cleanly to 4-bit nibbles) alongside the already-present custom-base explanation.
- **UX improvements:** The bit sandbox silently disappears above the 32-bit cap with no visible message explaining why — a discoverability gap.
- **Interactive improvements:** The bit-toggle sandbox is strong but underutilized versus its IP-tools usage (e.g. no prefix-length shading here, unlike CIDR calculator's use of the same component).
- **Educational improvements:** No "how it works," "common mistakes" (two's-complement/negative numbers aren't addressed at all — worth an explicit note since this converter is unsigned-only), or `related` link (ASCII converter and the IP tools' own bit-toggle usage are natural cross-links).
- **Professional features:** No CLI equivalents (`printf`, `bc`, Python `bin()/hex()/oct()`); no explicit pointer to where this exact conversion shows up elsewhere on the site (subnet masks, MAC/OUI fields, TCP flags bytes).
- **Wow feature:** Already shipped (bit-toggle sandbox). Next best: a signed/two's-complement mode toggle — a real, currently entirely unaddressed gap.

### ASCII converter

- **Strengths:** Bidirectional (text↔codes), clean per-character table. **The underlying calc logic is better than the tool's own name implies** — it already correctly handles full Unicode code points (`Array.from` + `codePointAt`/`fromCodePoint`), not just 7-bit ASCII.
- **Weaknesses:** Old "no copy button" — **STILL OPEN**, confirmed — one of only three tools sitewide with zero copy affordance. Old "ASCII-only framing undocumented for non-ASCII input" — **partially open, but for a different reason than assumed**: the code already handles Unicode gracefully (no silent breakage), but the UI never states that it supports the full Unicode range, so the _tool's own name and description_ misrepresent what it actually does.
- **Info to add:** One sentence stating "supports full Unicode, not just 7-bit ASCII" — resolves the old audit's concern outright.
- **UX improvements:** Copy-row / copy-column / copy-all-as-CSV.
- **Interactive improvements:** Click a character to highlight its table row.
- **Educational improvements:** No "how it works" (what ASCII/Unicode/code points are), "common mistakes" (assuming 1 byte per character — false outside ASCII, directly relevant given this tool's actual Unicode support), or `related` link.
- **Professional features:** No CLI equivalents (`ord()`/`chr()` in Python, `String.fromCharCode`); no UTF-8 byte-length vs. code-point-count distinction, despite the tool already doing code-point-level work correctly.
- **Wow feature:** A UTF-8 byte-breakdown column (showing e.g. `€` is 3 UTF-8 bytes, not 1) — genuinely differentiated, technically accurate, and a natural extension of code that's already Unicode-aware.

### Text diff viewer

- **Strengths:** Real Myers-diff-based line comparison via the `diff` npm package, not a naive string compare; clean color-coded added/removed rendering with strikethrough.
- **Weaknesses:** Old "line-level only, no word-level highlighting within a changed line" — **STILL OPEN**, confirmed — the same `diff` package already exports `diffWords`/`diffWordsWithSpace`/`diffChars`, so this is a low-effort swap, not a new dependency. Old "no copy button" — **STILL OPEN**, one of only three tools sitewide with zero copy affordance — can't copy the diff output at all. Old "no side-by-side view, no summary line" — both **STILL OPEN**.
- **Info to add:** What "line-level diff" means and its limitation vs. word-level — currently no framing at all.
- **UX improvements:** A summary line ("+2 additions, -1 removal") above the output — a one-line, cheap fix.
- **Interactive improvements:** A unified/side-by-side mode toggle and a line/word granularity toggle — both library-supported already, neither built.
- **Educational improvements:** No "how it works," "when to use this" (config diffing — genuinely on-theme for a networking site; the tool's own example data is literally `subnet mask:`/`gateway:`/`vlan:` lines, implying a "diff two router config snapshots" use case that's never stated anywhere).
- **Professional features:** No CLI equivalent (`diff`, `git diff --no-index`); the "enterprise" framing described above is nearly free to add given the example data already implies it.
- **Wow feature:** Word-level diff highlighting (cheap — the library already supports it) combined with a side-by-side view toggle — both correctly identified as the two biggest gaps versus competing diff tools, and the single most "behind competitors" tool in the entire 48.

---

# Part 2 — Category-Level Improvements

Shared components, visual systems, interaction patterns, and terminology references that would lift many tools at once rather than one tool at a time. All findings below are grounded in the adoption matrices the audit produced — see each category's table in the research notes for exactly which of its tools use what today.

## A shared "Educational Layer" component

No tool anywhere has a structured educational block, even though pieces of one exist unevenly (`Aside`, `GuidedMode` closing notes, per-row RFC columns). Build one `ToolEducation` component with five consistent, collapsible sections — **How it works**, **When to use this**, **Common mistakes**, **Troubleshooting tips**, **Related tools/visualizers/blog posts** — and roll it out tool by tool. This is the single most universal, highest-count gap found across all 48 tools and all three research passes independently flagged it. It should render below the calculator, above any expert-mode CLI section, and its "Related" sub-section should be the actual implementation of the `related` cross-linking system (see below) rather than a separate mechanism.

## Universal `related` cross-linking

The `related` prop on `ToolPageLayout`/`ReferencePageLayout` already exists, already works, and is used in exactly 3 places across 48 tools. This is close to a pure content-population task, not an engineering one. A worked list of currently-missing, obviously-adjacent pairs: CIDR↔Subnet↔Network Address↔Broadcast↔Wildcard Mask (mutual, all five); VLAN calculator↔802.1Q explorer; MAC lookup↔MAC formatter; Hash generator↔Hash verifier; Base64↔URL encode↔JWT decoder; JSON↔YAML↔XML formatters; DHCP options reference→DHCP DORA visualizer; ICMP explorer↔IP header explorer; Route Summarizer↔IP Range calculator; every tool the Scenario Simulator already embeds→that scenario page.

## A shared vendor CLI/config-snippet pattern

Four tools already prove the `Pill`-toggle "expert mode → CLI snippet" pattern works (Subnet calculator, VLAN calculator, STP overview, TCP header explorer) plus Administrative Distance reference's dual-vendor comparison table. Generalize this into one small `CliSnippet` component that accepts a vendor (`cisco` | `juniper` | `fortinet` | `linux`) and renders consistently, then extend the _existing_ Cisco-only snippets to add Juniper/Fortinet/Linux variants where they meaningfully differ, and add snippets to the tools that don't have one yet but clearly want one: BGP path comparison (`show bgp`-style output), Wildcard mask calculator (ACL/OSPF lines), MAC lookup (`show mac address-table`), DHCP options reference (`ip dhcp pool`), Route/LPM lookup simulators (`show ip route` with real `[AD/metric]` bracket notation), Hash generator/verifier (`sha256sum`, `Get-FileHash`, `openssl dgst`), Regex tester (grep/sed/language snippet export), JSON/YAML/XML formatters (`jq`/`yq`/`xmllint`).

## A shared RFC/standard citation pattern

`RfcFootnote` is proven in Protocols but essentially unused everywhere else. Extend it (or the per-row-RFC-column pattern DNS/TLS already use, whichever fits the tool's shape) to IP tools (RFC 1918/4632), VPN tools (RFC 1191/1981/9293/2409/4301/2784), Routing (RFC 4271/2328), Switching (IEEE 802.1D/802.1Q/802.1w), Security, and Utilities wherever a real standard underlies the tool.

## A shared "bit/byte diagram" system, more widely reused

`BitFieldDiagram`, `BitToggleSandbox`, and `HeaderByteDiagram` are all proven, all cheap to reuse, and each currently lives in essentially one place. A short, concrete adoption list: `BitFieldDiagram` for IPv6 calculator's address anatomy and Wildcard Mask calculator's inverted-bit view; `BitToggleSandbox` reused with a `prefixLength` prop wherever IP tools would benefit and in Binary/decimal/hex converter with networking-context shading; `HeaderByteDiagram` extended to a UDP-vs-TCP size-comparison pairing and wired live to TCP header explorer's own builder values instead of remaining static.

## A shared `TopologyCanvas`/`DeviceIcons` reuse pass

Proven exactly once (STP overview's fixed example). A concrete backlog: LPM simulator and Route lookup simulator's overlap/number-line diagrams; VLAN calculator's `TrunkDiagram` retrofit with real device glyphs; STP overview's own editable bridge/link list driving a live diagram instead of only the fixed example.

## A consistent preset-button pattern

Only Tunnel Overhead calculator has real presets today. A generalized `PresetRow` (label + click-to-fill) belongs on: MTU calculator (Ethernet 1500/PPPoE 1492/IPsec/GRE/jumbo), Latency calculator (real city-pair/cloud-region distances), VLAN calculator (1/1002-1005/4095), 802.1Q explorer (802.1p PCP priority names), STP overview (bridge priority multiples of 4096), Metric comparison tool (100M/1G/10G/40G reference bandwidth), Password generator (a slider, functionally a continuous preset).

## Consistent copy/export affordances

`ResultRow` and `CopyableTextarea` already cover the large majority of tools. Close the three remaining holdouts (Regex tester, ASCII converter, Text diff viewer — all currently zero-copy) and extend copy affordance to `DataTable` rows (currently every reference table's individual cells are still select-only) and to plain-`<table>`-based results that don't use `ResultRow` (Subnet calculator's VLSM/equal-split tables, IP Range calculator's block list, Packet Fragmentation calculator's fragment table).

## Standardized security-warning treatment

Two real, currently-unflagged security gaps (JWT `alg:none`/weak algorithms, Certificate viewer's unflagged weak signature algorithms) suggest a shared `SecurityWarning`/danger-`Badge` pattern worth building once and applying to both, rather than two bespoke fixes.

## Consistent mode-toggle component usage

Hash generator's mode toggle uses raw `<button>`s where every sibling tool (JwtDecoder, YamlFormatterTool, VLAN/STP expert toggles) uses the shared `Pill` component — a small but real visual-consistency fix, worth sweeping for other holdouts while touching these files for other reasons.

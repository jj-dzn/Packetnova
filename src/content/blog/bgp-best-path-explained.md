---
title: 'BGP best path explained'
description: 'How routers actually choose which path wins.'
date: '2026-07-25'
tags: ['bgp', 'routing', 'path-selection']
---

A BGP router will often learn several paths to the exact same prefix -- from different neighbors, via different providers, through different parts of the network. Only one of those paths gets installed and advertised onward. The best path algorithm is the specific, ordered sequence of tie-breakers BGP runs through to pick that one path, and understanding the order matters, because the _order_ is the whole story: a route can lose on every single attribute except the first one that actually differs, and that's the one that decides.

This walks through the order Cisco IOS uses (the most commonly taught version; other vendors follow the same spirit with minor differences -- noted where it matters), why each step exists, and a worked example. PacketNova's [BGP best path selection visualizer](/visualizers/bgp-best-path-selection) animates the example below step by step, and the [BGP route visualizer](/tools/bgp-route-visualizer) tool runs the full algorithm against paths you enter yourself.

## The order, and why each step exists

1. **Highest weight.** Weight is Cisco-proprietary and purely local to the router it's configured on -- it never gets advertised to anyone. It exists as an explicit administrative override: "on this router, always prefer this path, full stop." (Juniper and other vendors don't have an equivalent to weight; local preference is their top-precedence knob instead.)
2. **Highest local preference.** Unlike weight, local preference _is_ shared -- via iBGP, across every router inside the same AS. It's how an entire autonomous system agrees on which exit point outbound traffic should use, rather than each router deciding independently.
3. **Locally originated over learned.** A route your own router originated (via `network`, aggregation, or redistribution) is preferred over one learned from a neighbor.
4. **Shortest AS-path.** Fewer AS hops is treated as a rough proxy for a better path. It's not a real distance metric the way an IGP's cost is -- it's just a count of autonomous systems traversed -- which is exactly why it's four steps down the list, not the first thing checked.
5. **Lowest origin type.** IGP (originated via a `network` statement) beats EGP (largely historical at this point) beats Incomplete (redistributed from another routing protocol, so BGP has the least information about how it was actually determined).
6. **Lowest MED.** The Multi-Exit Discriminator is how a _neighboring_ AS hints which of its several entry points it'd prefer you use. Critically, MED values are normally only compared between paths learned from the _same_ neighboring AS -- comparing MEDs from two unrelated ASes would be comparing numbers with no shared meaning.
7. **eBGP over iBGP.** A path learned from a different AS (eBGP) is preferred over one learned from inside your own AS (iBGP) -- an iBGP-learned path just means another of your own routers already made this decision, so preferring the more direct external source avoids extra indirection.
8. **Lowest IGP metric to the BGP next hop.** If it's still tied, prefer whichever path's next hop is closer according to your interior routing protocol (OSPF, EIGRP, etc.).
9. **Oldest route** (for eBGP paths). Preferring the path that's been up longest discourages unnecessary route flapping when a newer, equally-good path shows up.
10. **Lowest router ID**, then **lowest neighbor IP address** -- final, purely deterministic tie-breakers so that if everything above is genuinely equal, every router in the network still converges on the identical answer.

## A worked example

Say three paths reach the same prefix:

| Path            | Weight | Local pref | AS-path               |
| --------------- | ------ | ---------- | --------------------- |
| A (via Router1) | 100    | 100        | [65001, 65002, 65003] |
| B (via Router2) | 100    | 200        | [65001, 65002]        |
| C (via Router3) | 50     | 150        | [65001]               |

Step 1 (weight) eliminates Path C immediately -- 50 loses to the 100/100 tie between A and B, regardless of C having by far the shortest AS-path. That's the order mattering in practice: AS-path length never even gets _considered_ here, because weight already decided.

With A and B tied on weight, step 2 (local preference) breaks it: B's 200 beats A's 100. Path B wins, without the algorithm ever needing to reach AS-path length, origin, or MED at all.

This exact scenario is what the [BGP best path visualizer](/visualizers/bgp-best-path-selection) animates -- watching weight eliminate one path and local preference eliminate another makes the "the first difference wins" behavior much more concrete than reading the list.

## Checking it on a real router

`show ip bgp <prefix>` lists every path BGP has learned for a prefix, with a `>` marking the current best path and each attribute (weight, local pref, AS-path, origin, MED) laid out per path -- everything needed to work through the algorithm by hand and confirm why a specific path won. When a path looks wrong, the fix is almost always upstream of the algorithm itself: a missing `route-map` that should have set local preference, a weight left at a stale value from earlier testing, or MED being compared across paths from different ASes where it was never meaningful to begin with.

## The practical takeaway

The list looks intimidating, but the actual skill is simple: find the _first_ attribute in the order where the candidate paths genuinely differ, and that's your answer -- everything below it is irrelevant to that particular decision. Most real-world "why is BGP picking the wrong path" questions turn out to be about local preference or weight being set (or not set) somewhere upstream, not about some obscure tie-breaker near the bottom of the list.

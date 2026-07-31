---
title: 'Troubleshooting packet loss'
description: 'A practical walkthrough for tracking down where packets go missing.'
date: '2026-07-30'
tags: ['troubleshooting', 'packet-loss', 'diagnostics']
---

"Packet loss" is a symptom, not a diagnosis -- it's the visible result of a dozen genuinely different underlying problems, from a bad cable to an overloaded router to a firewall doing exactly what it was configured to do. Chasing it effectively means narrowing down _where_ it's happening and _what category_ of cause that points to, rather than guessing at fixes. This is a practical walkthrough of both.

## What actually causes it

**Physical layer.** Damaged cabling, a failing transceiver, a bent fiber connector, or electromagnetic interference near a run of copper cable all cause bit errors that show up as dropped or corrupted frames. This is the easiest category to confirm and the easiest to rule out, covered below.

**Duplex mismatches.** If one side of a link is hard-set to full duplex and the other is left on auto-negotiate (and falls back to half), the half-duplex side can't detect collisions the way it expects to, and you get late collisions -- which look like loss, but are really a configuration problem, not a cable or hardware fault. Less common now that modern equipment auto-negotiates reliably, but still worth ruling out on older gear or manually configured links.

**Congestion.** An interface pushed past its capacity has nowhere to put excess traffic -- it either tail-drops indiscriminately once its queue is full, or (if QoS is configured) deliberately drops lower-priority traffic first to protect what matters more. This is loss working as designed, not a fault, which is exactly why it's worth distinguishing from the categories above.

**MTU and fragmentation.** Oversized packets that hit a device unable (or, with the Don't Fragment bit set, unwilling) to forward them as-is get dropped outright. See [Understanding MTU](/blog/understanding-mtu) for the full mechanism -- it's common enough to deserve its own writeup.

**Wireless-specific causes.** Weak signal, co-channel interference from neighboring networks, and roaming handoffs between access points all produce loss that has nothing to do with anything wired. If one segment of a path is Wi-Fi, check that segment specifically before assuming the problem is upstream.

**Filtering.** A firewall rule or ACL dropping traffic on purpose looks identical to "real" loss from the application's point of view. Worth checking early precisely because it's easy to rule in or out with a quick look at the device's own logs or drop counters.

**Routing problems.** Asymmetric routing (traffic takes a different path in each direction), a transient routing loop that expires packets' TTL, or a route flapping in and out can all cause loss that comes and goes in a way that looks like nothing you changed.

## Where to actually look

**Sustained ping, not a quick one.** A handful of pings tells you almost nothing about loss -- run a sustained ping (`ping -t` on Windows, or just a large count on Linux/macOS) and look at the actual loss percentage over a couple hundred packets. Consistent, low-single-digit loss reads very differently from loss that spikes only under load or only at certain times, and that pattern alone is a real clue.

**`mtr` or `pathping`, with a caveat.** These combine traceroute and ping, showing per-hop loss rather than just an end-to-end number, which sounds like it should immediately pinpoint the culprit hop. It often does -- but there's a specific, common false signal to watch for: many routers deprioritize _generating_ the ICMP time-exceeded replies that traceroute-style tools depend on, since that's control-plane work competing with actually forwarding traffic. An intermediate hop showing loss because it's slow to _reply_ to probes doesn't mean it's dropping the _real_ traffic passing through it. The signal that actually matters is loss that appears at some hop and then **persists at every hop after it** to the destination -- that's genuine loss on the path. Loss at a single hop that disappears again one hop later is almost always that hop just being slow to answer, not evidence of anything wrong.

**Interface counters, for anything you administer yourself.** `show interface` (or the equivalent on non-Cisco gear) reports input errors, CRC errors, collisions, and output drops directly from the hardware -- no probing or inference required. A steadily climbing CRC error count points squarely at a physical-layer problem (cable, connector, transceiver); climbing output drops on an otherwise healthy interface points at congestion. This is the most direct evidence available, and it's worth checking before reaching for any external diagnostic tool, on every device you actually have access to along the path.

**Both directions.** Because routing can be asymmetric, a clean traceroute in one direction doesn't guarantee the reverse path is equally clean. If loss is one-directional (uploads fine, downloads lossy, or vice versa), that's a strong hint the two directions are taking genuinely different paths.

## A practical order to check things in

1. Reproduce it with a sustained ping and get an actual loss percentage, not just a vibe.
2. Check interface counters on any device you control along the path -- this is the fastest way to confirm or rule out physical/duplex/congestion causes outright.
3. Run `mtr`/`pathping` in both directions, reading per-hop results with the persistence caveat above in mind.
4. If loss only shows up on larger transfers specifically, suspect MTU before anything else.
5. If loss correlates with time of day or load, suspect congestion; if it's constant regardless of load, suspect physical layer or a misconfiguration.

Packet loss rarely has a single universal fix, but it almost always has a specific, findable cause -- the goal of all of the above is narrowing the search space fast, rather than guessing at solutions before you know which category of problem you're actually looking at.

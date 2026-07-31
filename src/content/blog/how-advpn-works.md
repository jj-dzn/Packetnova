---
title: 'How ADVPN works'
description: 'Getting full-mesh performance out of a hub-and-spoke VPN, without full-mesh configuration.'
date: '2026-08-12'
tags: ['vpn', 'advpn', 'routing']
---

A traditional hub-and-spoke VPN has a structural problem: every spoke only has a tunnel to the hub, so even when two spokes are talking to each other, their traffic has to detour through the hub and back out again. That's easy to configure -- each spoke just needs one tunnel -- but it means the hub carries load for traffic that never actually needed to go through it, and every spoke-to-spoke conversation pays extra latency for the detour. Auto Discovery VPN (Fortinet's term for this; Cisco's equivalent is DMVPN Phase 3) solves this by letting spokes build direct, temporary tunnels to each other on demand, while keeping the simple hub-and-spoke setup for everything else.

## The problem it's solving

The alternative to hub-and-spoke is a full mesh -- every spoke tunneled directly to every other spoke -- which gets the latency and hub-load benefits but at a real operational cost: N spokes need on the order of N² tunnels configured, which becomes unmanageable fast as a network grows. ADVPN's goal is getting full-mesh _performance_, dynamically, from a hub-and-spoke _configuration_ -- you configure and manage a simple hub-and-spoke topology, and the direct paths appear automatically only where and when traffic actually needs them.

## The general mechanism

1. Spoke A sends traffic to Spoke B. Since only hub-spoke tunnels exist yet, this traffic takes the only path available: Spoke A → hub → Spoke B.
2. The hub recognizes it's acting as a relay for two spokes that could reach each other more directly, and tells Spoke A that a better path exists.
3. Spoke A and Spoke B, mediated by the hub, exchange the information needed to reach each other directly (their real, underlying reachable addresses) and negotiate a new tunnel directly between themselves.
4. Once that direct tunnel is up and routing has converged onto it, subsequent Spoke A ↔ Spoke B traffic flows through it directly -- the hub is no longer in the path at all for this conversation.
5. If the direct tunnel goes idle for long enough, it's torn down. It isn't a static addition to the topology -- it's built on demand and only sticks around while it's actually being used.

## How this differs by vendor

The concept above is consistent, but the actual protocol messages differ:

**Cisco DMVPN Phase 3** uses NHRP (Next Hop Resolution Protocol). When the hub notices it's just relaying between two spokes, it sends an **NHRP Redirect** to the source spoke. That spoke responds with an **NHRP Resolution Request**, which the hub forwards to the destination spoke; once resolved, the source spoke installs an NHRP shortcut route pointing directly at the destination spoke's real tunnel address, and traffic shifts onto the direct path.

**Fortinet ADVPN** uses its own shortcut negotiation: the hub sends a **shortcut offer** to the first spoke, which replies with a **shortcut query** back to the hub; the hub forwards that to the second spoke, which responds with a **shortcut reply**. Fortinet's implementation also specifically requires a dynamic routing protocol running over the overlay (BGP or RIPv2) so that routes can actually shift onto the new direct tunnel once it's established, rather than continuing to point at the hub out of habit.

Different message names, same shape: hub notices a shortcut opportunity, mediates an introduction between the two spokes, and gets out of the way once they can talk directly.

## Why this matters practically

The benefit isn't just "spoke-to-spoke traffic is faster," though it is -- it's that the hub stops being a scaling bottleneck for traffic it never needed to carry in the first place. A hub sized for hub-to-spoke traffic (which is often the majority of traffic in, say, a branch-to-datacenter topology) doesn't also need to be sized for every branch-to-branch conversation on top of that. And because shortcuts are established on demand rather than pre-provisioned, the network only builds the direct tunnels that traffic patterns actually justify, instead of the operational overhead of a full mesh that's mostly idle.

## The practical takeaway

ADVPN (or DMVPN Phase 3, same idea under a different name) is what lets you configure a network like hub-and-spoke -- simple, and easy to reason about -- while it behaves like a full mesh wherever traffic patterns actually call for it. The hub's role shifts from "relay for everything" to "matchmaker for spokes that need to talk directly," which is a meaningfully different job with a much smaller footprint.

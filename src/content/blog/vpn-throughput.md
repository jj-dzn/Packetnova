---
title: 'VPN throughput'
description: 'Why a VPN rarely delivers the full speed of the link underneath it.'
date: '2026-08-02'
tags: ['vpn', 'performance', 'tcp']
---

"My internet is a gigabit, but I only get 200Mbps through the VPN" is one of the most common VPN complaints, and it's rarely a sign that anything is actually broken. A VPN tunnel adds real, structural overhead between an application and the raw link -- some of it bytes-on-the-wire overhead, some of it CPU cost, some of it just how TCP behaves once you add latency. This walks through where that gap actually comes from.

## Encapsulation eats into the ceiling

Every VPN protocol wraps your traffic in its own header (and for encrypted VPNs, encrypts and often pads the payload too), which is bytes that used to be data and are now overhead. [Understanding MTU](/blog/understanding-mtu) covers this mechanism and the typical numbers -- WireGuard around 60 bytes per packet, IPsec 50 bytes or more depending on cipher -- but the short version is that a smaller effective MTU means proportionally more of every packet's capacity is spent on headers instead of payload, especially noticeable at higher line rates where that fixed per-packet overhead adds up. [PacketNova's VPN tunnel overhead calculator](/tools/vpn-tunnel-overhead-calculator) and [VPN packet flow visualizer](/visualizers/vpn-packet-flow) cover this piece directly.

That's real, but it's usually the smallest contributor to the gap -- a few percent, not the difference between a gigabit link and 200Mbps.

## Encryption is CPU work, and it's often single-threaded per flow

Encrypting and decrypting every byte costs CPU cycles, and on hardware with AES-NI (the hardware AES acceleration built into effectively every x86 CPU since around 2010), that cost is small. On hardware without it -- a lot of consumer routers, some older or lower-power embedded devices -- encryption can become the actual bottleneck well before the network link itself is saturated.

Even on capable hardware, a more common limit is that a single tunnel is often processed on a single CPU core. If your test is one TCP connection through the tunnel, you may be measuring the throughput ceiling of _one core's_ crypto performance, not the link's real capacity. This is exactly why VPN throughput tests should use multiple parallel streams (`iperf3 -P 4`, for example) before concluding the link itself is the limit -- a single-flow test that's slow but a multi-flow test that adds up to much more is a strong signal the bottleneck was per-flow processing, not bandwidth.

## Latency taxes throughput even with no loss at all

TCP's maximum throughput on a single connection is bounded by its window size divided by round-trip time -- the bandwidth-delay product. A VPN tunnel, especially one routed through a distant exit point, adds real round-trip latency on top of the underlying path. Even with a perfectly healthy link and zero packet loss, that added latency lowers the achievable throughput of a single TCP connection unless the window is scaled up to compensate. This is a fundamental property of TCP, not a flaw in any particular VPN implementation -- it's the same reason a satellite link with excellent bandwidth but 600ms latency still delivers disappointing single-connection throughput.

## TCP-over-TCP: a specific, well-documented failure mode

If a VPN tunnels TCP traffic inside its own TCP connection (OpenVPN's TCP mode is the common example), packet loss on the underlying network gets handled _twice_: the outer TCP connection retransmits and backs off its congestion window, and the inner TCP connection -- which experiences that same loss as a stall or gap -- does the exact same thing independently, on top of the outer one. The two retransmission and congestion-control layers interact badly, and under any real packet loss the effect compounds into throughput that's much worse than either layer would produce alone. This is well-documented enough that OpenVPN's own guidance is to prefer UDP mode specifically to avoid it -- a VPN protocol running over UDP only has to deal with loss once, at the one layer that's actually supposed to handle it.

## Testing it properly

A throughput test that isolates what's actually limiting things:

1. Test with multiple parallel streams, not just one -- this separates "the link is the limit" from "one flow's crypto/window is the limit."
2. Compare UDP-mode and TCP-mode if the VPN protocol supports both -- a large gap between them points at TCP-over-TCP interaction, not the tunnel itself.
3. Check CPU utilization on both endpoints during the test -- a core pegged at 100% while throughput plateaus is the encryption cost, not the network.
4. Compare the VPN's added latency (ping through the tunnel vs. ping to the same destination without it) against the throughput drop -- a large latency increase alongside a large throughput drop points at the bandwidth-delay product, not overhead or CPU.

## The practical takeaway

A VPN "slowing down" your connection by some percentage from encapsulation overhead is normal and expected. A VPN cutting your throughput by 70-80% usually isn't overhead -- it's one specific bottleneck (a CPU core, a single-flow window limit, or TCP-over-TCP) dominating the result, and each of those has a distinct, checkable signature rather than being one generic "VPN is slow" problem.

---
title: 'Packet capture basics'
description: 'Where to capture from, what filters actually do, and a common beginner trap.'
date: '2026-08-08'
tags: ['packet-capture', 'wireshark', 'troubleshooting']
---

A packet capture is the ground truth of what actually happened on the wire -- no interpretation, no summarized log line, just the frames themselves. That makes it the most reliable troubleshooting tool available, and also the easiest one to drown yourself in without a bit of technique. This covers where to actually capture from, the difference between two kinds of filter that are commonly confused, and enough to get a capture that's useful rather than overwhelming.

## What a capture actually is

On Linux, capture tools work through libpcap; on Windows, through Npcap (the modern successor to WinPcap). Either way, the mechanism is the same: the capture tool asks the network interface to hand it a copy of every frame it sees, in addition to whatever the OS's normal networking stack does with them. What "every frame it sees" means depends heavily on where you're capturing from.

## Where to capture from

**Your own host.** The simplest option -- capture on the interface of the machine having the problem. You'll see everything that machine sends and receives, which is often exactly what's needed and requires no special network access.

**A SPAN/mirror port on a switch.** If you need to see traffic _between two other devices_ -- traffic that never touches your machine -- a switch can be configured to mirror another port's traffic to the port you're capturing from. This requires switch access and configuration, and it comes with a real caveat: mirroring is typically lower priority than actually forwarding traffic, so a switch under heavy load can silently drop mirrored copies before you ever see them. A capture from a SPAN port that shows _no_ problem doesn't fully rule one out if the switch was busy.

**A tap.** A dedicated hardware device that sits inline on a physical link and passively copies every frame to a monitoring port, without relying on a switch's CPU to do the mirroring. Taps don't drop under load the way SPAN ports can, and a good one keeps the link up even if it loses power -- but they need physical hardware in the path, which is a bigger ask than a switch configuration change.

**Promiscuous mode.** By default, a network interface only passes traffic addressed to itself up to the OS -- everything else on the wire gets ignored at the hardware level. Promiscuous mode disables that filtering, which matters for capturing on a shared medium (a hub, or a mirrored/tapped port carrying other devices' traffic) but does essentially nothing on a normal switched port, since a switch simply never sends you frames addressed to someone else in the first place -- there's nothing extra to catch regardless of promiscuous mode being on.

## Capture filters vs. display filters: not the same thing

This is the single most common beginner trap, because Wireshark has both and they use _different syntax_.

A **capture filter** is applied at capture time, before anything is written to disk -- using BPF (Berkeley Packet Filter) syntax, like `tcp port 443`. Anything that doesn't match is discarded immediately and permanently; there's no getting it back later. Capture filters exist to keep capture size manageable on a busy link, at the cost of being unable to change your mind about what you filtered out.

A **display filter** is applied after the fact, to a capture you already have -- using Wireshark's own syntax, like `tcp.port == 443`. Nothing is discarded; the display filter just controls what's currently shown, and you can change or remove it freely to look at the same capture a different way.

The trap: typing `tcp.port == 443` (valid display filter syntax) into a _capture_ filter field does nothing useful, because that's not BPF syntax -- and the reverse, typing `tcp port 443` (valid BPF) into a display filter, is likewise not what Wireshark's display filter syntax expects. When in doubt, default to capturing broadly with a light or no capture filter and doing all the actual narrowing with display filters afterward -- you can always filter a capture you already have more ways than you first thought of, but you can't un-discard data a capture filter threw away.

## Getting a useful capture, not an overwhelming one

A capture with zero filtering on a busy interface can be enormous and largely irrelevant to the actual problem. A few starting points that keep things focused without the capture-filter risk above:

- Filter to one host's conversation: `ip.addr == 10.0.0.5` (both directions, source or destination)
- Filter to one protocol while you get oriented: `tcp`, `dns`, `icmp`
- Filter to a specific port when you already know what service is involved: `tcp.port == 443`
- Combine them: `ip.addr == 10.0.0.5 && tcp.port == 443`

All of the above are display filters -- run the capture with little or no filtering, then narrow down from there once you can see what's actually in it.

## Reading what you find

A raw capture is only useful once you can read the fields inside each packet -- source/destination ports, sequence and acknowledgment numbers, flags, TTL, and so on. PacketNova's [TCP](/tools/tcp-header-explorer), [UDP](/tools/udp-header-explorer), [IP](/tools/ip-header-explorer), and [ICMP](/tools/icmp-explorer) header explorers break each of those fields down individually, which is a useful reference to have open next to a real capture until the layout becomes second nature.

## The practical takeaway

Capture broadly, filter for display rather than at capture time unless you have a specific reason not to, and match where you capture from to what you're actually trying to see -- your own host for your own traffic, a mirror or tap for traffic between other devices. The tool gives you ground truth; the technique is mostly about not throwing away the part you needed or drowning in the part you didn't.

---
title: 'Understanding MTU'
description: 'Why packet size limits matter and how they cause silent failures.'
date: '2026-07-20'
tags: ['mtu', 'fragmentation', 'troubleshooting']
---

MTU -- Maximum Transmission Unit -- is the largest payload a single frame can carry at a given hop. It sounds like a minor plumbing detail until it isn't: MTU mismatches are one of the most common causes of connections that work fine for small requests and then mysteriously hang on anything larger. This post covers what MTU actually limits, what happens when a packet is too big, and why the standard fix (Path MTU Discovery) so often fails silently in practice.

## The default: 1500 bytes

Standard Ethernet's MTU is 1500 bytes -- the IEEE 802.3 payload limit, on top of which sits a 14-byte Ethernet header and a 4-byte frame check sequence. That 1500 figure is why you'll see it everywhere: it's the ceiling every IP packet has to fit under to cross a typical Ethernet segment without being split up.

Subtract protocol overhead from that 1500 and you get the room actually available for data. A typical TCP/IPv4 packet spends 20 bytes on the IP header and 20 more on the TCP header, leaving 1460 bytes of payload -- which is exactly why 1460 is such a common default TCP MSS (maximum segment size) on Ethernet-connected hosts. (PacketNova's [MSS calculator](/tools/mss-calculator) and [MTU calculator](/tools/mtu-calculator) do this arithmetic for you, including for tunnel overhead -- more on that below.)

## What happens when a packet is too big

It depends on the IP version, and the difference matters:

- **IPv4** allows fragmentation: a router that receives a packet too large for the next hop can split it into smaller fragments, each with its own IP header, to be reassembled by the destination. This works, but it's expensive -- every fragment needs re-processing, and if just one fragment is lost, the entire original packet has to be retransmitted, not just the missing piece.
- **IPv4 with the Don't Fragment (DF) bit set** disables that behavior. Instead of fragmenting, a router that can't forward the packet as-is drops it and sends back an ICMP "Fragmentation Needed" message (type 3, code 4) telling the source what MTU it should have used.
- **IPv6 doesn't allow routers to fragment in transit at all.** Only the sending host can fragment, and only before the packet ever leaves it. If an IPv6 packet is too big for a hop along the path, that router drops it and sends back an ICMPv6 "Packet Too Big" message (type 2) instead -- there's no in-network fallback.

That ICMP message is the whole mechanism modern MTU handling depends on. Which is exactly the problem.

## Path MTU Discovery, and how it goes dark

Path MTU Discovery (PMTUD) is the process of a host sending packets with DF set, backing off the size whenever it gets an ICMP "too big" reply, until it finds the largest size that makes it all the way through. It's a simple, elegant design -- and it depends entirely on those ICMP messages actually arriving back at the sender.

They frequently don't. Plenty of firewalls and security policies block inbound ICMP wholesale, treating it as a scanning/DoS risk rather than essential control-plane traffic. When that happens, the oversized packet gets silently dropped somewhere in the middle of the path, no error ever makes it back, and the sending host has no idea anything went wrong -- it just keeps retransmitting the same packet that keeps disappearing. This failure mode has a name because it's common enough to need one: a **PMTUD black hole**.

The symptom is a specific, recognizable pattern: SSH sessions that connect but hang the moment you do something that returns a large response (like `ls` in a big directory); HTTPS sites that load small pages but time out on ones with big responses; ping working fine (ICMP echo packets are small) while everything else stalls. If that pattern shows up, MTU is the first thing worth checking, not the last.

## Where effective MTU quietly shrinks

1500 is the Ethernet ceiling, not a guarantee. Anything that wraps your traffic in another layer of encapsulation eats into that budget:

| Encapsulation            | Typical overhead            | Common resulting MTU                        |
| ------------------------ | --------------------------- | ------------------------------------------- |
| PPPoE (common on DSL)    | 8 bytes                     | 1492                                        |
| GRE tunnel               | ~24 bytes                   | ~1476                                       |
| IPsec (ESP, tunnel mode) | 50+ bytes, varies by cipher | often 1400-1450                             |
| WireGuard                | ~60 bytes per hop           | ~1420 (WireGuard's own quick-start default) |

None of these are exotic setups -- PPPoE alone covers a huge share of home internet connections, and VPN tunnels are everywhere in corporate networks. If the tunnel endpoint's effective MTU isn't configured to account for its own overhead, you get exactly the black-hole symptoms above, except now they're intermittent and infuriating to reproduce, because they only show up on packets large enough to hit the reduced ceiling.

## Testing it yourself

You don't need to guess -- you can binary-search the actual path MTU directly with `ping`, using the DF-equivalent flag and varying the payload size:

```
# Linux
ping -M do -s 1472 8.8.8.8

# Windows
ping -f -l 1472 8.8.8.8
```

1472 is a deliberate choice: 1500 minus a 20-byte IP header and 8-byte ICMP header, so a reply at exactly that size confirms the full 1500-byte Ethernet MTU is getting through end to end. If it fails, drop the size until it succeeds -- the largest size that works, plus that same 28-byte overhead, is your actual path MTU. Losing a specific, memorable chunk (like exactly 8, 24, or 60 bytes from 1500) is a strong hint about which kind of encapsulation is responsible.

## The practical takeaway

MTU problems are quiet by design -- the whole point of PMTUD is that you're not supposed to notice it working. When it can't work (because ICMP is filtered somewhere), the failure looks like nothing in particular: a hang, a timeout, a connection that "just doesn't work" for no obvious reason. If you ever see something fail specifically on larger transfers while small requests sail through, you're very likely looking at an MTU issue, not a routing or DNS one -- and a five-minute `ping` sweep will usually tell you exactly where the ceiling actually is.

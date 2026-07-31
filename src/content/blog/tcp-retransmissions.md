---
title: 'TCP retransmissions'
description: 'How TCP notices loss and recovers from it -- and what it costs when it does.'
date: '2026-08-05'
tags: ['tcp', 'retransmissions', 'performance']
---

TCP promises reliable delivery, and retransmission is the mechanism that keeps that promise when something along the path drops a segment. There are two genuinely different ways TCP notices loss happened, they respond at very different speeds, and every retransmission event has a real cost beyond just resending the data. This covers how it actually works, not just that it does.

## Two ways to notice loss

**Timeout (RTO expiry).** The sender tracks a retransmission timeout for each segment, calculated from the measured round-trip time and its recent variance (RFC 6298's formula, in short: expect the RTO to track the RTT plus some margin for how much the RTT has been jumping around). If no acknowledgment arrives before that timer expires, TCP assumes the segment was lost and retransmits. This is the slow path -- by design, since firing too aggressively on a connection with naturally variable RTT would cause unnecessary retransmissions of data that was just delayed, not lost.

**Fast retransmit.** When a receiver gets a segment out of order -- meaning some earlier segment is missing -- it immediately re-sends an ACK for the last byte it received _in order_, rather than waiting. If the sender sees three of these duplicate ACKs in a row, it treats that as strong evidence of loss (not just reordering) and retransmits immediately, without waiting for the timeout at all. This is dramatically faster than waiting on RTO in practice, and it's the mechanism that handles the vast majority of loss on a healthy connection with reasonable traffic volume -- RTO expiry is really the fallback for when there isn't enough subsequent traffic to generate three duplicate ACKs.

## SACK changes what gets resent, not just when

Without Selective Acknowledgment (SACK), a retransmission event historically meant resending _everything_ from the lost segment onward, even data that actually arrived fine afterward -- classic go-back-N behavior. SACK lets the receiver report exactly which non-contiguous ranges of data it already has, so the sender can retransmit only the specific gap instead of everything after it. SACK is effectively universal on modern stacks, but it has to be negotiated in the TCP handshake (it's an option, not baseline behavior) -- if you ever see full-window retransmission behavior on a modern capture, checking whether SACK was actually negotiated is a reasonable first question.

## Retransmissions aren't free, even when they work

Every loss event that triggers a retransmission normally also triggers a congestion window reduction -- classic Reno-style congestion control cuts the window roughly in half on loss, and while modern algorithms like CUBIC are less punishing, they still back off. This is the part that's easy to miss: the cost of a retransmission isn't just the extra round trip to resend the data, it's that the connection's throughput takes a hit going forward too, until the congestion window climbs back up. A connection with frequent small loss events can spend most of its life in the recovery ramp rather than at full window, which shows up as mediocre sustained throughput even when no single retransmission looks dramatic in isolation.

## Not every retransmission means something was actually lost

A **spurious retransmission** is one triggered by an RTO that fired too early -- the original segment wasn't lost, it (and its ACK) were just slower than the timeout expected, often because of a sudden, temporary jump in RTT (a burst of congestion, a route change) that the RTO estimate hadn't caught up to yet. The practical effect is a wasted retransmission and an unnecessary congestion window cut for a connection that didn't actually need to slow down. This is exactly why RTO calculation uses RTT _variance_, not just the average -- a connection with wildly fluctuating RTT needs a larger safety margin before assuming timeout means loss.

## Where to actually see this

`netstat -s` (both Linux and Windows expose TCP retransmission counters this way) gives a quick per-host summary of how much retransmission has been happening system-wide. For a specific conversation, Wireshark flags retransmissions directly in its packet list and has a dedicated "TCP Retransmission" filter, and duplicate ACKs are equally visible if you're looking at the raw sequence/ack numbers -- which is exactly what [PacketNova's TCP header explorer](/tools/tcp-header-explorer) breaks down field by field, useful for building the mental model before reading a real capture.

## The practical takeaway

A handful of retransmissions on a long-running connection is completely normal -- networks lose packets sometimes, and TCP recovering from that quickly is the system working as intended. What's worth investigating is _volume and pattern_: retransmissions clustered at a specific time of day point at congestion, retransmissions that correlate with larger transfers point at [MTU](/blog/understanding-mtu) or an intermediate device dropping fragments, and a connection stuck in a cycle of loss-and-recovery is the visible symptom of whatever's actually causing the [packet loss](/blog/troubleshooting-packet-loss) upstream of it -- retransmissions are the effect, worth chasing back to the cause rather than treated as the problem itself.

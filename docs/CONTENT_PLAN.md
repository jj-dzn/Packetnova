# Content plan

Full inventory of tools, visualizers, learning topics, and blog posts. Use this as the master checklist — check items off as built.

## Tools

### IP tools

- [ ] CIDR calculator
- [ ] Subnet calculator (equal split + VLSM)
- [ ] IPv6 calculator (expand/compress/classify + subnetting)
- [ ] Wildcard mask calculator
- [ ] IP range calculator
- [ ] Broadcast calculator
- [ ] Network address calculator
- [ ] Route summarizer

### VPN tools

- [ ] VPN tunnel overhead calculator
- [ ] MTU calculator
- [ ] MSS calculator
- [ ] Bandwidth estimator
- [ ] Latency calculator
- [ ] Transfer time calculator
- [ ] Packet fragmentation calculator

### Routing

- [ ] BGP route visualizer
- [ ] Longest prefix match simulator
- [ ] Route lookup simulator
- [ ] Administrative distance reference
- [ ] Metric comparison tool

### Switching

- [ ] VLAN calculator
- [ ] 802.1Q tag explorer
- [ ] MAC address lookup
- [ ] MAC formatter
- [ ] STP overview

### Protocols

- [ ] TCP header explorer
- [ ] UDP header explorer
- [ ] IP header explorer
- [ ] ICMP explorer
- [ ] DNS record reference
- [ ] HTTP status reference
- [ ] TLS version explorer
- [ ] DHCP options reference

### Security

- [ ] Hash generator
- [ ] Hash verifier
- [ ] JWT decoder
- [ ] JWT inspector
- [ ] Base64 encode/decode
- [ ] URL encode/decode
- [ ] Certificate viewer
- [ ] Password generator

### Utilities

- [ ] Regex tester
- [ ] JSON formatter
- [ ] YAML formatter
- [ ] XML formatter
- [ ] Epoch converter
- [ ] Binary/decimal/hex converter
- [ ] ASCII converter
- [ ] Text diff viewer

## Interactive visualizers

- [ ] TCP three-way handshake
- [ ] TLS handshake
- [ ] Packet encapsulation
- [ ] OSI model explorer
- [ ] TCP/IP stack explorer
- [ ] NAT flow simulator
- [ ] Routing decision simulator
- [ ] BGP best path selection
- [ ] OSPF SPF animation
- [ ] VPN packet flow
- [ ] DHCP DORA sequence

## Learn section — deprioritized (future, not in current scope)

**Decision:** Not building this for now. Networking education is already well covered elsewhere (RFCs, Cisco docs, Practical Networking, Professor Messer, etc.) — PacketNova's actual differentiator is the tools and the interactive visualizers, not another set of explainer pages competing with sites that already do this well. Writing 14 topics properly is also a large, ongoing content burden (research, accuracy risk, diagrams) that isn't worth taking on before the core toolkit is solid.

If revisited later, treat it as genuinely optional and much smaller in scope than originally listed — e.g. 3-4 pages max, built only where a Learn page would meaningfully extend a tool/visualizer you've already shipped (so writing is additive, not from scratch), or opened up to community contributions once the site has traffic. Original topic list kept below for reference only:

TCP/IP, Routing, Switching, VPN, Firewalls, BGP, OSPF, DNS, DHCP, IPv6, SASE, SD-WAN, Packet analysis, Troubleshooting.

## Blog posts (starter list)

- [ ] Understanding MTU
- [ ] BGP best path explained
- [ ] VPN throughput
- [ ] TCP retransmissions
- [ ] Packet capture basics
- [ ] How ADVPN works
- [ ] Troubleshooting packet loss

## Bonus / fun ideas (post-launch backlog)

Not part of the MVP — these are optional additions once the core toolkit is live, useful for differentiating PacketNova from other reference sites. Kept separate so they don't creep into the milestone checklist above.

**Overlaps with existing plan (already covered, just note the fun angle):**

- Interactive explainer of how the internet works (DNS, TCP handshake) → already covered by the Visualizers section (TCP three-way handshake, DNS is a reference tool). Could be packaged as a single "how the internet works" landing page that links out to the individual visualizers.
- Subnet calculator / CIDR cheat-sheet → already in Tools (IP tools). "Slick UI" is a design bar, not a new build.
- MTU/packet-loss troubleshooting guide with interactive diagrams → overlaps VPN tools (MTU calculator) + Learn section (troubleshooting topic). Worth combining into one Learn page once both exist.

**Net new ideas (not currently in scope, genuinely optional):**

- [ ] **Live packet visualizer** — simulated traffic animated as particles, leans into the "nova" branding. Best suited as a homepage hero easter egg or a standalone `/visualizers/traffic-starfield` page rather than a core tool — it's decorative/atmospheric, not diagnostic. Pure client-side canvas/WebGL, no real network access needed (simulated data only).
- [ ] **"Ping pet"** — small creature whose animation reflects live latency to a site the user picks. Fun engagement mechanic; technically simple (uses `fetch`/timing, no backend). Good candidate for a lightweight "labs" or "fun" corner of the site rather than the main nav.
- [ ] **Retro terminal easter egg** — ASCII art, fake boot sequence, "hacking" animation aesthetic. Could live at a hidden route (e.g. `/terminal` or a konami-code trigger) rather than being a primary page — keeps the main site's professional tone intact while still being discoverable for people who enjoy it.
- [ ] **Uptime/ping monitor dashboard** — differs from the rest of the toolkit because it needs _some_ periodic execution model (client-side polling while the tab is open, since there's no backend/cron available on GitHub Pages). Frame it clearly as "checks while this page is open," not a real monitoring service, to avoid misleading users.
- [ ] **Networking/sysadmin/homelab blog angle** — extension of the existing Blog section; just a tonal note to keep some posts casual/community-flavored (homelab projects, "packet capture of the day") alongside the more formal technical ones (BGP best path, MTU).

**Recommendation:** revisit this list after Milestone 9 (first visualizer shipped). Doing the "nova" particle visualizer well could be a strong homepage differentiator, but it's pure polish — don't let it compete with core tool coverage for time.

## Priority build order (first 5 tools)

Recommended starting five, chosen for a mix of high search value and reusable logic (IP parsing underlies most of the rest):

1. CIDR calculator
2. Subnet calculator
3. IP range calculator
4. Broadcast calculator
5. Network address calculator

These five share one `lib/validation/ip.ts` parser — build that once, well-tested, before the first tool component.

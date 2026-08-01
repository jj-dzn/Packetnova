# Architecture

## Folder structure

```
src/
  components/
    layout/            Nav, Footer, PageShell
    ui/                 Button, Card, Badge, Input, Select, Tooltip
  features/
    tools/
      ip/               CIDR, subnet, IPv6, wildcard mask, IP range, broadcast, network address
      vpn/              tunnel overhead, MTU, MSS, bandwidth, latency, transfer time, fragmentation
      routing/          BGP route visualizer, LPM simulator, route lookup, AD reference, metric comparison
      switching/        VLAN calc, 802.1Q explorer, MAC lookup, MAC formatter, STP overview
      protocols/        TCP/UDP/IP/ICMP header explorers, DNS record ref, HTTP status ref, TLS version explorer, DHCP options
      security/          hash gen/verify, JWT decode/inspect, base64, URL encode, cert viewer, password gen
      utilities/         regex tester, JSON/YAML/XML formatter, epoch converter, base converter, ASCII converter, diff viewer
    visualizers/         TCP handshake, TLS handshake, encapsulation, OSI explorer, TCP/IP stack, NAT flow,
                          routing decision, BGP best path, OSPF SPF animation, VPN packet flow, DHCP DORA
    learn/               topic pages (TCP/IP, routing, switching, VPN, firewalls, BGP, OSPF, DNS, DHCP, IPv6, SASE, SD-WAN,
                          packet analysis, troubleshooting)
    blog/                 post listing, post renderer, category/tag filtering
    search/               client-side search index + UI
  lib/
    calculations/         PURE functions only — one file per tool, no React imports
    validation/            input parsing/validation shared across tools (IP parsing, CIDR parsing, etc.)
    formatting/             number/unit formatting helpers
  hooks/                   useDarkMode, useLocalStorage (settings only, not app data), useSearch
  ai/                       AI abstraction layer — see below
  content/
    blog/*.md
    learn/*.md
  types/                   shared TypeScript types (NetworkAddress, CIDRResult, etc.)
public/
  logo.svg
  favicon
  og-image.png
```

## Why calculation logic is separated from UI

Every tool's math lives in `lib/calculations/` as a plain TypeScript function with no React dependency, e.g.:

```ts
// lib/calculations/subnet.ts
export function calculateSubnet(ip: string, cidr: number): SubnetResult { ... }
```

The component (`features/tools/ip/SubnetCalculator.tsx`) only handles input state and rendering; it calls the pure function and displays the result. This means:

- Every calculator can have a unit test suite with known-correct vectors (RFC examples), independent of UI.
- Logic can be reused across tools (e.g. IP parsing shared by CIDR, subnet, and IP range calculators).
- If the AI layer is added later, it can call the same pure functions directly instead of duplicating logic.

## AI abstraction layer (stubbed, inactive)

AI is explicitly NOT part of the initial product. The only thing built now is a thin interface so nothing needs restructuring later.

```ts
// ai/provider.ts
export interface AIRequest {
  task:
    | 'analyze-pcap'
    | 'explain-log'
    | 'review-firewall-config'
    | 'route-analysis'
    | 'analyze-har'
    | 'audit-config'
    | 'generate-tac-report'
  input: string | File
  context?: Record<string, unknown>
}

export interface AIResponse {
  summary: string
  details?: unknown
}

export interface AIProvider {
  isAvailable(): boolean
  analyze(request: AIRequest): Promise<AIResponse>
}

// ai/nullProvider.ts
export const NullProvider: AIProvider = {
  isAvailable: () => false,
  analyze: async () => ({ summary: 'AI features are not yet available.' }),
}
```

Rules for this layer:

- Do not build a plugin system, provider registry, or config UI for this yet — one interface and one null implementation is enough.
- Any future AI feature (pcap analysis, config audit, etc.) consumes this interface, not a direct API call.
- No AI code should appear in `features/tools` or `features/visualizers` components directly.

## Routing on GitHub Pages

GitHub Pages has no server-side rewrites, so client-side routing needs one of:

- Hash-based routing (`/#/tools/subnet-calculator`) — simplest, zero config, slightly uglier URLs.
- History-mode routing with a `404.html` redirect trick (copy `index.html` to `404.html`, or use a redirect script) — cleaner URLs, one extra build step.

Decision: pick this in `docs/TECH_DECISIONS.md` before building the router.

## Data correctness sourcing

Reference data that must be accurate (HTTP status codes, DNS record types, administrative distances, etc.) lives in `src/content/reference/*.json` — structured, hand-verified once, imported by components. Never hardcode reference tables inline in JSX.

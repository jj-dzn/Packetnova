export interface ScenarioListing {
  slug: string
  title: string
  category: string
  symptom: string
  /** Absent for the original linear read-through-with-embedded-tools
   * format. 'branching' scenarios (v2.1+) have real wrong-turn choice
   * points and an optional timed, scored challenge mode. */
  format?: 'branching'
}

// Mirrors visualizers.ts's shape -- feeds the /scenarios index page, search,
// and page metadata from one place. Each scenario chains multiple
// already-shipped tools/visualizers (see src/features/scenarios/) into a
// guided troubleshooting narrative; this listing is just what's needed to
// discover and link to them.
export const scenarios: ScenarioListing[] = [
  {
    slug: 'site-to-site-vpn-failure',
    title: 'Site-to-site VPN failure',
    category: 'VPN',
    symptom: 'Small requests work fine over the tunnel. Large transfers just hang.',
  },
  {
    slug: 'subnetting-mistake',
    title: 'Subnetting mistake',
    category: 'IP',
    symptom: "A newly carved-out site's host got the wrong route -- or no route at all.",
  },
  {
    slug: 'routing-black-hole',
    title: 'Routing black hole',
    category: 'Routing',
    symptom: 'A route sits right there in the table, but traffic to it silently disappears.',
  },
  {
    slug: 'nat-port-forwarding',
    title: 'NAT problem',
    category: 'NAT',
    symptom: 'Outbound works perfectly. Nothing from the internet can reach a private host.',
  },
  {
    slug: 'mtu-fragmentation',
    title: 'MTU issue',
    category: 'VPN',
    symptom: 'Everything small works. Larger transfers hang with no error at all.',
  },
  {
    slug: 'bgp-path-selection',
    title: 'BGP path selection',
    category: 'Routing',
    symptom: 'Traffic keeps taking the path with more AS hops, not fewer.',
  },
  {
    slug: 'vlan-misconfiguration',
    title: 'VLAN misconfiguration',
    category: 'Switching',
    symptom: "Two hosts on the same switch, meant to share a VLAN, can't reach each other.",
  },
  {
    slug: 'dhcp-lease-failure',
    title: 'No IP address: DHCP across a VLAN boundary',
    category: 'DHCP',
    symptom: 'A new laptop never gets a real address -- stuck on a self-assigned 169.254.x.x.',
    format: 'branching',
  },
  {
    slug: 'switching-loop',
    title: 'Switching loop: one floor, random drops',
    category: 'Switching',
    symptom: "One access switch's CPU is pegged and its MAC table won't settle down.",
    format: 'branching',
  },
  {
    slug: 'dns-negative-cache',
    title: 'DNS that works everywhere except one network',
    category: 'DNS',
    symptom: 'A new subdomain resolves fine everywhere -- except one office network.',
    format: 'branching',
  },
]

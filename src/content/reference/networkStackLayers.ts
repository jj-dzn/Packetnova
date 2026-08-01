export interface OsiLayer {
  number: number
  name: string
  description: string
  /** A longer, 2-4 sentence explanation -- what this layer is actually
   * for, and (where relevant) how cleanly real-world software actually
   * follows OSI's theoretical split at this boundary. */
  detail: string
  examples: string
  /** Typical hardware/software that operates primarily at this layer. */
  devices: string
  dataUnit: string
}

export interface TcpIpLayer {
  number: number
  name: string
  description: string
  detail: string
  examples: string
  devices: string
  dataUnit: string
  /** OSI layer numbers this layer absorbs, listed highest-first. */
  osiLayerNumbers: number[]
}

// Standard 7-layer OSI model, listed Application (7) down to Physical (1).
export const OSI_LAYERS: OsiLayer[] = [
  {
    number: 7,
    name: 'Application',
    description: 'The interface applications use to access network services directly.',
    detail:
      "This is the only layer an application actually talks to -- everything below it is invisible plumbing from the application's point of view. A browser calling an HTTP library, a mail client speaking SMTP, a phone app doing a DNS lookup: all Layer 7. It's also the layer most people can actually name a protocol from, since these are the ones with visible, human-meaningful behavior -- a URL, an email, a webpage -- rather than headers no one but a router ever reads.",
    examples: 'HTTP, DNS, SMTP, FTP',
    devices: 'Web browsers, mail clients, DNS resolvers, application servers',
    dataUnit: 'Data',
  },
  {
    number: 6,
    name: 'Presentation',
    description: 'Translates, encrypts, and compresses data for the application layer.',
    detail:
      "Historically responsible for translating between an application's native data format and a common wire format -- character encoding, compression, and (in the original OSI design) encryption all lived here. In practice, the modern internet mostly folded this layer's job into the application itself: TLS is usually described as living here, but it's implemented as a library the application calls directly, not a separate protocol stack layer the way IP or Ethernet are. This is one of the clearest places where the 7-layer model describes a clean theoretical split that real software doesn't strictly follow.",
    examples: 'TLS/SSL, JPEG, ASCII/Unicode encoding',
    devices: 'Rarely a dedicated device -- mostly libraries and codecs inside the application',
    dataUnit: 'Data',
  },
  {
    number: 5,
    name: 'Session',
    description: 'Establishes, manages, and terminates sessions between applications.',
    detail:
      "Manages the lifecycle of a conversation between two applications -- opening it, tracking where it's up to, and closing it down cleanly. Like Presentation, this is one of OSI's more theoretical layers: TCP/IP has no distinct session layer at all, and most of what OSI assigns here (session tokens, reconnect logic) actually lives inside the application layer or a library it calls, in real software.",
    examples: 'NetBIOS, RPC, session tokens',
    devices:
      'Rarely a dedicated device -- session state is tracked by the application or its library',
    dataUnit: 'Data',
  },
  {
    number: 4,
    name: 'Transport',
    description: 'Provides end-to-end delivery, with reliability (TCP) or speed (UDP).',
    detail:
      "The first layer where 'reliable or fast' becomes an actual choice: TCP trades speed for guaranteed, ordered delivery and automatic retransmission of lost segments; UDP does none of that, trading reliability for lower overhead and no connection setup delay. Port numbers also live here -- they're what lets one IP address run dozens of independent services (a web server and a mail server on the same machine) without their traffic getting mixed up.",
    examples: 'TCP, UDP, port numbers',
    devices: 'Stateful firewalls (they track connections at this layer), load balancers',
    dataUnit: 'Segments (TCP) / Datagrams (UDP)',
  },
  {
    number: 3,
    name: 'Network',
    description: 'Handles logical addressing and routing between different networks.',
    detail:
      "Where addressing stops being local. A MAC address (Layer 2) only means something on the segment it's physically attached to; an IP address is globally meaningful and routable, which is exactly what lets a packet cross from one physical network to a completely different one. Routing decisions -- which next hop gets a packet closer to its destination -- happen here, one hop at a time, with no single router needing to know the entire path in advance.",
    examples: 'IP, ICMP, routers',
    devices: 'Routers, Layer 3 switches',
    dataUnit: 'Packets',
  },
  {
    number: 2,
    name: 'Data Link',
    description: 'Handles node-to-node delivery and error detection on the local network segment.',
    detail:
      'Handles delivery across exactly one physical link or shared segment -- not the whole journey, just the next hop. MAC addresses are only meaningful here, which is why they get stripped and rewritten at every hop while the IP header underneath stays untouched end-to-end. Switches operate almost entirely at this layer, learning which MAC addresses live off which physical port and forwarding frames accordingly, without ever looking at the IP header inside.',
    examples: 'Ethernet, Wi-Fi (802.11), MAC addresses',
    devices: 'Switches, network interface cards (NICs), bridges',
    dataUnit: 'Frames',
  },
  {
    number: 1,
    name: 'Physical',
    description: 'Transmits raw bits over a physical medium.',
    detail:
      "The actual electrical signals, light pulses, or radio waves carrying bits across a medium -- copper, fiber, or air. Nothing here knows what a MAC address or an IP address is; this layer's entire job is turning a 1 or a 0 into a physical signal and back again, as fast and reliably as the medium allows.",
    examples: 'Ethernet cabling, Wi-Fi radio, fiber optics',
    devices: 'Cables, hubs, repeaters, wireless radios, transceivers',
    dataUnit: 'Bits',
  },
]

// The 4-layer TCP/IP (Internet protocol suite) model, listed Application (4)
// down to Network Access (1). osiLayerNumbers records which OSI layers each
// one absorbs, so the side-by-side comparison view can align and connect
// them without hardcoding the mapping twice.
export const TCP_IP_LAYERS: TcpIpLayer[] = [
  {
    number: 4,
    name: 'Application',
    description: "Combines OSI's Session, Presentation, and Application layers (5-7) into one.",
    detail:
      'TCP/IP never split Session, Presentation, and Application into separate layers the way OSI did, because in practice they were never cleanly separate in real software -- session management and data formatting are usually just something the application (or a library it calls) handles directly, not distinct protocol layers with their own headers on the wire.',
    examples: 'HTTP, DNS, TLS, SMTP',
    devices: 'Browsers, mail clients, DNS resolvers, application servers',
    dataUnit: 'Data',
    osiLayerNumbers: [7, 6, 5],
  },
  {
    number: 3,
    name: 'Transport',
    description: "Same role as OSI's Transport layer (4) -- TCP and UDP.",
    detail:
      "Identical role and identical protocols to OSI's Transport layer -- the 4-layer model doesn't actually simplify anything here, it just doesn't bother drawing a boundary OSI draws above it.",
    examples: 'TCP, UDP',
    devices: 'Stateful firewalls, load balancers',
    dataUnit: 'Segments (TCP) / Datagrams (UDP)',
    osiLayerNumbers: [4],
  },
  {
    number: 2,
    name: 'Internet',
    description: "Same role as OSI's Network layer (3) -- logical addressing and routing.",
    detail:
      'This is the layer that gives TCP/IP its name -- and arguably its clearest naming choice: "Internet" describes exactly what this layer does (routes between networks), where OSI\'s more generic "Network" doesn\'t say that as directly.',
    examples: 'IP, ICMP',
    devices: 'Routers, Layer 3 switches',
    dataUnit: 'Packets',
    osiLayerNumbers: [3],
  },
  {
    number: 1,
    name: 'Network Access',
    description: "Combines OSI's Data Link and Physical layers (1-2) into one.",
    detail:
      "Combines Data Link and Physical on the reasoning that, in practice, a given link technology (Ethernet, Wi-Fi) always bundles its own framing and physical signaling together as one spec -- real networks don't mix-and-match an 802.3 (Ethernet) frame format with an arbitrary physical medium the way OSI's clean separation implies you could.",
    examples: 'Ethernet, Wi-Fi, ARP',
    devices: 'Switches, NICs, cables, wireless radios',
    dataUnit: 'Frames',
    osiLayerNumbers: [2, 1],
  },
]

export interface LayerColorClasses {
  /** A persistent, always-visible left border identifying which group a
   * layer belongs to -- independent of any "selected" state. */
  leftBorder: string
  /** All-sides border at two different opacities, for components (like the
   * encapsulation visualizer's nested boxes) that aren't a left-border-only
   * row. Written as complete literal classes -- not composed at runtime --
   * since Tailwind's class scanner needs the full string present verbatim
   * in source, not string-concatenated from a base color at render time. */
  borderStrong: string
  borderMuted: string
  activeBg: string
  activeText: string
}

const ACCENT_LAYER_CLASSES: LayerColorClasses = {
  leftBorder: 'border-l-accent',
  borderStrong: 'border-accent/40',
  borderMuted: 'border-accent/30',
  activeBg: 'bg-accent/10',
  activeText: 'text-accent',
}
const ACCENT_ALT_LAYER_CLASSES: LayerColorClasses = {
  leftBorder: 'border-l-accent-alt',
  borderStrong: 'border-accent-alt/40',
  borderMuted: 'border-accent-alt/30',
  activeBg: 'bg-accent-alt/10',
  activeText: 'text-accent-alt',
}

// The design system deliberately keeps the palette to two decorative hues
// (accent, accent-alt) -- success/warning/danger are reserved for
// validation states. So "per-layer color language" here means a
// consistent checkerboard across the 4 TCP/IP-equivalent groups (App,
// Transport, Internet, Network Access), not one hue per OSI layer, shared
// by every visualizer that shows these layers: OSI Model Explorer,
// TCP/IP Stack Explorer, and Packet Encapsulation.
export function osiLayerColorClasses(osiLayerNumber: number): LayerColorClasses {
  const isTransportOrLink = osiLayerNumber === 4 || osiLayerNumber <= 2
  return isTransportOrLink ? ACCENT_ALT_LAYER_CLASSES : ACCENT_LAYER_CLASSES
}

export function tcpIpLayerColorClasses(tcpIpLayerNumber: number): LayerColorClasses {
  return tcpIpLayerNumber % 2 === 0 ? ACCENT_LAYER_CLASSES : ACCENT_ALT_LAYER_CLASSES
}

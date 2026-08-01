export interface OsiLayer {
  number: number
  name: string
  description: string
  examples: string
  dataUnit: string
}

export interface TcpIpLayer {
  number: number
  name: string
  description: string
  examples: string
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
    examples: 'HTTP, DNS, SMTP, FTP',
    dataUnit: 'Data',
  },
  {
    number: 6,
    name: 'Presentation',
    description: 'Translates, encrypts, and compresses data for the application layer.',
    examples: 'TLS/SSL, JPEG, ASCII/Unicode encoding',
    dataUnit: 'Data',
  },
  {
    number: 5,
    name: 'Session',
    description: 'Establishes, manages, and terminates sessions between applications.',
    examples: 'NetBIOS, RPC, session tokens',
    dataUnit: 'Data',
  },
  {
    number: 4,
    name: 'Transport',
    description: 'Provides end-to-end delivery, with reliability (TCP) or speed (UDP).',
    examples: 'TCP, UDP, port numbers',
    dataUnit: 'Segments (TCP) / Datagrams (UDP)',
  },
  {
    number: 3,
    name: 'Network',
    description: 'Handles logical addressing and routing between different networks.',
    examples: 'IP, ICMP, routers',
    dataUnit: 'Packets',
  },
  {
    number: 2,
    name: 'Data Link',
    description: 'Handles node-to-node delivery and error detection on the local network segment.',
    examples: 'Ethernet, Wi-Fi (802.11), MAC addresses',
    dataUnit: 'Frames',
  },
  {
    number: 1,
    name: 'Physical',
    description: 'Transmits raw bits over a physical medium.',
    examples: 'Ethernet cabling, Wi-Fi radio, fiber optics',
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
    examples: 'HTTP, DNS, TLS, SMTP',
    dataUnit: 'Data',
    osiLayerNumbers: [7, 6, 5],
  },
  {
    number: 3,
    name: 'Transport',
    description: "Same role as OSI's Transport layer (4) -- TCP and UDP.",
    examples: 'TCP, UDP',
    dataUnit: 'Segments (TCP) / Datagrams (UDP)',
    osiLayerNumbers: [4],
  },
  {
    number: 2,
    name: 'Internet',
    description: "Same role as OSI's Network layer (3) -- logical addressing and routing.",
    examples: 'IP, ICMP',
    dataUnit: 'Packets',
    osiLayerNumbers: [3],
  },
  {
    number: 1,
    name: 'Network Access',
    description: "Combines OSI's Data Link and Physical layers (1-2) into one.",
    examples: 'Ethernet, Wi-Fi, ARP',
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

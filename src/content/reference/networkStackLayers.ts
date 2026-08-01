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

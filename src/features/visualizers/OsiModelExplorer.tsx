import { LayerExplorer, type LayerInfo } from './LayerExplorer'

// Standard 7-layer OSI model, listed Application (7) down to Physical (1).
const LAYERS: LayerInfo[] = [
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

export function OsiModelExplorer() {
  return (
    <LayerExplorer
      category="Visualizer"
      title="OSI model explorer"
      description="Click through each OSI layer and see what happens to data at each one."
      layers={LAYERS}
    />
  )
}

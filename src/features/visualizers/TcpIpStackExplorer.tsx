import { LayerExplorer, type LayerInfo } from './LayerExplorer'

// The 4-layer TCP/IP (Internet protocol suite) model, listed Application (4)
// down to Network Access (1). Each description names the OSI layer(s) it
// corresponds to, since comparing against OSI is this visualizer's point.
const LAYERS: LayerInfo[] = [
  {
    number: 4,
    name: 'Application',
    description: "Combines OSI's Session, Presentation, and Application layers (5-7) into one.",
    examples: 'HTTP, DNS, TLS, SMTP',
    dataUnit: 'Data',
  },
  {
    number: 3,
    name: 'Transport',
    description: "Same role as OSI's Transport layer (4) -- TCP and UDP.",
    examples: 'TCP, UDP',
    dataUnit: 'Segments (TCP) / Datagrams (UDP)',
  },
  {
    number: 2,
    name: 'Internet',
    description: "Same role as OSI's Network layer (3) -- logical addressing and routing.",
    examples: 'IP, ICMP',
    dataUnit: 'Packets',
  },
  {
    number: 1,
    name: 'Network Access',
    description: "Combines OSI's Data Link and Physical layers (1-2) into one.",
    examples: 'Ethernet, Wi-Fi, ARP',
    dataUnit: 'Frames',
  },
]

export function TcpIpStackExplorer() {
  return (
    <LayerExplorer
      category="Visualizer"
      title="TCP/IP stack explorer"
      description="Compare the TCP/IP model against OSI and see how real protocols map to each layer."
      layers={LAYERS}
    />
  )
}

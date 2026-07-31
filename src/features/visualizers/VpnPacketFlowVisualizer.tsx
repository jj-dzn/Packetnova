import { MiddleboxFlowVisualizer, type MiddleboxStep } from './MiddleboxFlowVisualizer'

const CLIENT_ADDR = '10.0.0.5'
const DEST_ADDR = '198.51.100.20:443'

const STEPS: MiddleboxStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The client wants to reach a destination through the VPN tunnel. No tunnel traffic yet.',
    middleValue: null,
    hop: null,
  },
  {
    title: '1. Client encrypts and encapsulates',
    description:
      "The client's VPN software encrypts the original packet and wraps it in a new outer packet addressed to the VPN gateway.",
    middleValue: 'Tunnel: idle',
    hop: { direction: 'right', segment: 'left-middle', label: '🔒 ESP: encrypted original packet' },
  },
  {
    title: '2. Gateway decrypts and forwards',
    description:
      'The VPN gateway strips the outer packet, decrypts the payload, and forwards the original packet on to the real destination.',
    middleValue: 'Tunnel: active',
    hop: {
      direction: 'right',
      segment: 'middle-right',
      label: `decrypted: dst=${DEST_ADDR}`,
    },
  },
  {
    title: '3. Destination replies',
    description:
      'The destination replies as normal -- it has no idea the request came through a tunnel.',
    middleValue: 'Tunnel: active',
    hop: { direction: 'left', segment: 'middle-right', label: 'reply packet' },
  },
  {
    title: '4. Gateway encrypts and returns',
    description:
      "The gateway encrypts the reply, wraps it for the tunnel, and sends it back to the client's VPN software to be unwrapped.",
    middleValue: 'Tunnel: active',
    hop: { direction: 'left', segment: 'left-middle', label: '🔒 ESP: encrypted reply' },
  },
]

export function VpnPacketFlowVisualizer() {
  return (
    <MiddleboxFlowVisualizer
      category="Visualizer"
      title="VPN packet flow"
      description="Follow a packet through VPN encapsulation, encryption, and tunneling to the far end."
      leftLabel="Client"
      leftValue={CLIENT_ADDR}
      middleLabel="VPN gateway"
      middleIdleValue="Tunnel: idle"
      rightLabel="Destination"
      rightValue={DEST_ADDR}
      steps={STEPS}
    />
  )
}

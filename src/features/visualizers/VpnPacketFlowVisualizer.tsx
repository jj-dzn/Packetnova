import { useState } from 'react'
import { VisualizerPageLayout } from './VisualizerPageLayout'
import { MiddleboxFlowContent, type MiddleboxStep } from './MiddleboxFlowVisualizer'
import { SequenceDiagramContent, type SequenceStep } from './SequenceDiagramVisualizer'
import { Pill } from '../../components/ui/Pill'

const CLIENT_ADDR = '10.0.0.5'
const DEST_ADDR = '198.51.100.20:443'

const TUNNEL_STEPS: MiddleboxStep[] = [
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
      "The client's VPN software encrypts the entire original IP packet and wraps it in a new outer IP packet addressed to the VPN gateway -- the original headers are hidden inside.",
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

const TRANSPORT_CLIENT_ADDR = '10.0.0.5'
const TRANSPORT_DEST_ADDR = '10.0.0.20:443'

const TRANSPORT_STEPS: SequenceStep[] = [
  {
    title: 'Ready to connect',
    description: `Both hosts (${TRANSPORT_CLIENT_ADDR} and ${TRANSPORT_DEST_ADDR}) run IPsec directly with each other -- no gateway in between rewriting anything.`,
    leftState: 'Idle',
    rightState: 'Idle',
    segment: null,
  },
  {
    title: '1. Client encrypts the payload only',
    description:
      'The original IP header (real source and destination addresses) is left untouched. Only the payload is encrypted, with an ESP header inserted between the IP header and it.',
    leftState: 'Encrypting payload...',
    rightState: 'Idle',
    segment: {
      direction: 'right',
      label: '🔒 ESP: original IP header intact + encrypted payload',
    },
  },
  {
    title: '2. Destination decrypts and replies',
    description:
      'The destination decrypts the payload directly -- there was never a separate gateway to strip an outer packet, so this round trip took one hop instead of two.',
    leftState: 'Waiting for reply',
    rightState: 'Decrypted, replying',
    segment: {
      direction: 'left',
      label: '🔒 ESP: original IP header intact + encrypted reply',
    },
  },
]

type Mode = 'tunnel' | 'transport'

export function VpnPacketFlowVisualizer() {
  const [mode, setMode] = useState<Mode>('tunnel')

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="VPN packet flow"
      description={
        mode === 'tunnel'
          ? 'Follow a packet through VPN encapsulation, encryption, and tunneling to the far end.'
          : 'Transport mode protects the payload directly between two IPsec peers -- no gateway, and the original IP header survives unchanged.'
      }
      related={[
        { to: '/tools/vpn-tunnel-overhead-calculator', label: 'VPN tunnel overhead calculator' },
      ]}
    >
      <div className="mb-6 flex gap-2">
        <Pill active={mode === 'tunnel'} onClick={() => setMode('tunnel')}>
          Tunnel mode
        </Pill>
        <Pill active={mode === 'transport'} onClick={() => setMode('transport')}>
          Transport mode
        </Pill>
      </div>

      {mode === 'tunnel' ? (
        <MiddleboxFlowContent
          leftLabel="Client"
          leftValue={CLIENT_ADDR}
          middleLabel="VPN gateway"
          middleIdleValue="Tunnel: idle"
          rightLabel="Destination"
          rightValue={DEST_ADDR}
          steps={TUNNEL_STEPS}
        />
      ) : (
        <SequenceDiagramContent
          leftLabel="Client"
          rightLabel="Destination"
          steps={TRANSPORT_STEPS}
        />
      )}
    </VisualizerPageLayout>
  )
}

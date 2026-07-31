import { MiddleboxFlowVisualizer, type MiddleboxStep } from './MiddleboxFlowVisualizer'

const PRIVATE_ADDR = '192.168.1.10:5000'
const PUBLIC_ADDR = '203.0.113.5:40001'
const SERVER_ADDR = '203.0.113.50:443'

const STEPS: MiddleboxStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The private host wants to reach a server on the internet. The NAT table is empty.',
    middleValue: null,
    hop: null,
  },
  {
    title: '1. Host sends the packet',
    description: `The host sends a packet from its private address (${PRIVATE_ADDR}) toward the public server.`,
    middleValue: null,
    hop: { direction: 'right', segment: 'left-middle', label: `src=${PRIVATE_ADDR}` },
  },
  {
    title: '2. Router translates and forwards',
    description: `The NAT router records the mapping and rewrites the source address to a public one (${PUBLIC_ADDR}) before forwarding.`,
    middleValue: `${PRIVATE_ADDR}  ⇄  ${PUBLIC_ADDR}`,
    hop: { direction: 'right', segment: 'middle-right', label: `src=${PUBLIC_ADDR}` },
  },
  {
    title: '3. Server replies',
    description: `The server has no idea a private host exists -- it just replies to the public address it saw (${PUBLIC_ADDR}).`,
    middleValue: `${PRIVATE_ADDR}  ⇄  ${PUBLIC_ADDR}`,
    hop: { direction: 'left', segment: 'middle-right', label: `dst=${PUBLIC_ADDR}` },
  },
  {
    title: '4. Router translates back',
    description:
      'The router looks up the mapping, rewrites the destination back to the private address, and delivers it to the host.',
    middleValue: `${PRIVATE_ADDR}  ⇄  ${PUBLIC_ADDR}`,
    hop: { direction: 'left', segment: 'left-middle', label: `dst=${PRIVATE_ADDR}` },
  },
]

export function NatFlowVisualizer() {
  return (
    <MiddleboxFlowVisualizer
      category="Visualizer"
      title="NAT flow simulator"
      description="Watch how NAT translates a private address and port as a packet leaves the network."
      leftLabel="Private host"
      leftValue={PRIVATE_ADDR}
      middleLabel="NAT router"
      middleIdleValue="No mappings yet"
      rightLabel="Public server"
      rightValue={SERVER_ADDR}
      steps={STEPS}
    />
  )
}

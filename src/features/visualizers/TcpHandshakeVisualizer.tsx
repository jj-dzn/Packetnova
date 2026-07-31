import { VisualizerPageLayout } from './VisualizerPageLayout'
import { StepControls } from './StepControls'
import { useStepPlayer } from '../../hooks/useStepPlayer'

interface HandshakeStep {
  title: string
  description: string
  clientState: string
  serverState: string
  segment: { direction: 'right' | 'left'; label: string } | null
}

const STEPS: HandshakeStep[] = [
  {
    title: 'Ready to connect',
    description:
      'The client wants to open a TCP connection to the server. The server is listening for incoming connections.',
    clientState: 'CLOSED',
    serverState: 'LISTEN',
    segment: null,
  },
  {
    title: '1. SYN',
    description:
      'The client picks an initial sequence number (100) and sends a SYN segment to start the handshake.',
    clientState: 'SYN_SENT',
    serverState: 'LISTEN',
    segment: { direction: 'right', label: 'SYN seq=100' },
  },
  {
    title: '2. SYN-ACK',
    description:
      "The server acknowledges the client's SYN (ack=101) and sends its own SYN with its initial sequence number (300).",
    clientState: 'SYN_SENT',
    serverState: 'SYN_RECEIVED',
    segment: { direction: 'left', label: 'SYN-ACK seq=300 ack=101' },
  },
  {
    title: '3. ACK',
    description:
      "The client acknowledges the server's SYN (ack=301). Both sides now consider the connection established.",
    clientState: 'ESTABLISHED',
    serverState: 'ESTABLISHED',
    segment: { direction: 'right', label: 'ACK ack=301' },
  },
]

export function TcpHandshakeVisualizer() {
  const player = useStepPlayer(STEPS.length)
  const current = STEPS[player.step]!

  return (
    <VisualizerPageLayout
      category="Visualizer"
      title="TCP three-way handshake"
      description="Watch SYN, SYN-ACK, and ACK establish a connection step by step."
    >
      <div
        tabIndex={0}
        onKeyDown={player.onKeyDown}
        aria-label="TCP handshake visualizer. Use the Previous and Next buttons, or the left and right arrow keys, to step through."
        className="flex flex-col gap-8 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="grid grid-cols-2 gap-8">
          <HostBox label="Client" state={current.clientState} />
          <HostBox label="Server" state={current.serverState} />
        </div>

        <div className="mx-4 flex min-h-[2.5rem] flex-col gap-4">
          {STEPS.map((step, index) => {
            if (index === 0 || !step.segment || player.step < index) return null
            const { direction, label } = step.segment
            const arrow = direction === 'right' ? '→' : '←'
            return (
              <div key={index} className="relative h-9">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                <div
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-accent/40 bg-bg px-3 py-1 font-mono text-xs text-accent ${
                    player.canAutoPlay
                      ? direction === 'right'
                        ? 'animate-pn-slide-right'
                        : 'animate-pn-slide-left'
                      : ''
                  }`}
                  style={
                    player.canAutoPlay ? undefined : { left: direction === 'right' ? '100%' : '0%' }
                  }
                >
                  {arrow} {label}
                </div>
              </div>
            )
          })}
        </div>

        <div aria-live="polite">
          <h2 className="font-medium">{current.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{current.description}</p>
        </div>

        <StepControls player={player} totalSteps={STEPS.length} />
      </div>
    </VisualizerPageLayout>
  )
}

function HostBox({ label, state }: { label: string; state: string }) {
  const established = state === 'ESTABLISHED'
  return (
    <div className="rounded-lg border border-border bg-bg p-4 text-center">
      <p className="text-sm font-medium">{label}</p>
      <p className={`mt-1 font-mono text-xs ${established ? 'text-success' : 'text-fg-muted'}`}>
        {state}
      </p>
    </div>
  )
}

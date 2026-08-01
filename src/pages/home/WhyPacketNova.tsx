import { useScrollReveal } from '../../hooks/useScrollReveal'

const reasons = [
  {
    title: 'Correctness first',
    description:
      'Every calculator is backed by a tested, pure function -- no guessing, no black boxes.',
  },
  {
    title: 'No backend, ever',
    description: 'Everything runs in your browser. No account, no tracking, no server round-trip.',
  },
  {
    title: 'Useful without AI',
    description:
      'AI is a future enhancement here, never the product. Every tool stands on its own today.',
  },
  {
    title: 'Built for engineers',
    description:
      "Tools and interactive visualizers you'd actually reach for -- not another explainer site.",
  },
]

export function WhyPacketNova() {
  const { ref, revealed } = useScrollReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      className={`py-14 transition-all duration-500 ease-out ${revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <h2 className="mb-8 text-xl font-semibold">Why PacketNova</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {reasons.map((reason) => (
          <div key={reason.title}>
            <h3 className="font-medium text-accent">{reason.title}</h3>
            <p className="mt-1 text-sm text-fg-muted">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

import { SectionHeader } from './SectionHeader'
import { PreviewCard } from './PreviewCard'

const visualizers = [
  {
    title: 'TCP three-way handshake',
    description: 'Watch SYN, SYN-ACK, and ACK establish a connection step by step.',
  },
  {
    title: 'TLS handshake',
    description: 'See exactly how a TLS session gets negotiated and encrypted.',
  },
  {
    title: 'Packet encapsulation',
    description: "Follow a packet as it's wrapped from application data down to frames.",
  },
]

export function FeaturedVisualizers() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Interactive visualizers"
        subtitle="Step-by-step animations of how protocols actually work"
        viewAllHref="/visualizers"
        viewAllLabel="View all visualizers"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visualizers.map((item) => (
          <PreviewCard key={item.title} category="Visualizer" href="/visualizers" {...item} />
        ))}
      </div>
    </section>
  )
}

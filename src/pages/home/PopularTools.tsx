import { SectionHeader } from './SectionHeader'
import { PreviewCard } from '../../components/ui/PreviewCard'

const tools = [
  {
    title: 'CIDR calculator',
    description: 'Break down any CIDR block into network, broadcast, and usable host range.',
  },
  {
    title: 'Subnet calculator',
    description: 'Split a network into subnets and see the resulting masks at a glance.',
  },
  {
    title: 'IP range calculator',
    description: 'Convert between IP ranges and CIDR notation instantly.',
  },
  {
    title: 'Broadcast calculator',
    description: 'Find the broadcast address for any IP and subnet mask.',
  },
  {
    title: 'Network address calculator',
    description: 'Find the network address for any IP and subnet mask.',
  },
]

export function PopularTools() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Popular tools"
        subtitle="The first five tools launching in Milestone 6"
        viewAllHref="/tools"
        viewAllLabel="View all tools"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <PreviewCard key={tool.title} category="IP" href="/tools" {...tool} />
        ))}
      </div>
    </section>
  )
}

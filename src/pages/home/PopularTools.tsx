import { SectionHeader } from './SectionHeader'
import { PreviewCard } from '../../components/ui/PreviewCard'

const tools = [
  {
    title: 'CIDR calculator',
    description: 'Break down any CIDR block into network, broadcast, and usable host range.',
    href: '/tools/cidr-calculator',
  },
  {
    title: 'Subnet calculator',
    description: 'Split a network into subnets and see the resulting masks at a glance.',
    href: '/tools/subnet-calculator',
  },
  {
    title: 'IP range calculator',
    description: 'Convert between IP ranges and CIDR notation instantly.',
    href: '/tools/ip-range-calculator',
  },
  {
    title: 'Broadcast calculator',
    description: 'Find the broadcast address for any IP and subnet mask.',
    href: '/tools/broadcast-calculator',
  },
  {
    title: 'Network address calculator',
    description: 'Find the network address for any IP and subnet mask.',
    href: '/tools/network-address-calculator',
  },
]

export function PopularTools() {
  return (
    <section className="py-16">
      <SectionHeader
        title="Popular tools"
        subtitle="Five IP calculators, ready to use"
        viewAllHref="/tools"
        viewAllLabel="View all tools"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <PreviewCard key={tool.title} category="IP" comingSoon={false} {...tool} />
        ))}
      </div>
    </section>
  )
}

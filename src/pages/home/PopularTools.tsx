import { SectionHeader } from './SectionHeader'
import { PreviewCard } from '../../components/ui/PreviewCard'
import { toolCategories } from '../../content/reference/tools'

const tools = [
  {
    title: 'CIDR calculator',
    description: 'Break down any CIDR block into network, broadcast, and usable host range.',
    href: '/tools/cidr-calculator',
  },
  {
    title: 'Subnet calculator',
    description: 'Split a network into equal subnets, or allocate variable-length (VLSM) subnets.',
    href: '/tools/subnet-calculator',
  },
  {
    title: 'IP range calculator',
    description: 'Convert between IP ranges and CIDR notation instantly.',
    href: '/tools/ip-range-calculator',
  },
  {
    title: 'Broadcast calculator',
    description: 'Find the broadcast address and broadcast domain for any IP and subnet.',
    href: '/tools/broadcast-calculator',
  },
  {
    title: 'Network address calculator',
    description: 'Find the network address for any IP, and what kind of address it is.',
    href: '/tools/network-address-calculator',
  },
]

const liveToolCount = toolCategories.reduce(
  (count, category) => count + category.tools.filter((tool) => tool.slug).length,
  0,
)

export function PopularTools() {
  return (
    <section className="py-14">
      <SectionHeader
        title="Popular tools"
        subtitle={`A few favorites -- ${liveToolCount} tools live across the full toolkit`}
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

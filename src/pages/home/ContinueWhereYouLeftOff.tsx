import { Link } from 'react-router'
import { SectionHeader } from './SectionHeader'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'

const SHOWN_COUNT = 4

// Only renders once there's real history -- a first-time visitor sees
// nothing here, not an empty or placeholder section. Reads straight from
// the same recently-viewed store every ToolPageLayout/ReferencePageLayout
// visit writes to, so this stays current with zero per-tool wiring.
export function ContinueWhereYouLeftOff() {
  const recent = useRecentlyViewed()
  if (recent.length === 0) return null

  return (
    <section className="py-14">
      <SectionHeader
        title="Continue where you left off"
        subtitle="Picked up from this browser, not an account"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recent.slice(0, SHOWN_COUNT).map((item) => (
          <Link key={item.href} to={item.href} className="block">
            <Card interactive tilt className="flex h-full flex-col gap-3">
              <Badge tone="accent">{item.category}</Badge>
              <h3 className="font-medium">{item.title}</h3>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

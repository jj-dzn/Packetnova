import { Link } from 'react-router'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ToolEducation } from '../ToolEducation'
import { Aside } from '../Aside'
import { DataTable } from '../../../components/ui/DataTable'
import {
  administrativeDistances,
  type AdEntry,
} from '../../../content/reference/administrativeDistance'

interface VendorComparisonEntry {
  source: string
  cisco: number
  juniper: number
}

// Only sources with a real, well-defined counterpart on both platforms --
// EIGRP is Cisco-proprietary and has no Juniper equivalent at all, so it's
// left out rather than forced into a comparison that doesn't exist.
const VENDOR_COMPARISON: VendorComparisonEntry[] = [
  { source: 'Connected interface', cisco: 0, juniper: 0 },
  { source: 'Static route', cisco: 1, juniper: 5 },
  { source: 'OSPF (internal)', cisco: 110, juniper: 10 },
  { source: 'OSPF (AS-external)', cisco: 110, juniper: 150 },
  { source: 'IS-IS Level 1', cisco: 115, juniper: 15 },
  { source: 'IS-IS Level 2', cisco: 115, juniper: 18 },
  { source: 'RIP', cisco: 120, juniper: 100 },
  { source: 'External BGP (eBGP)', cisco: 20, juniper: 170 },
  { source: 'Internal BGP (iBGP)', cisco: 200, juniper: 170 },
]

export function AdministrativeDistanceReference() {
  return (
    <ReferencePageLayout
      category="Routing"
      title="Administrative distance reference"
      description="Default administrative distance for every routing source -- lower always wins when a router learns the same network from multiple sources."
      related={[
        { to: '/tools/route-lookup-simulator', label: 'Route lookup simulator' },
        { to: '/scenarios/routing-black-hole', label: 'Scenario: Routing black hole' },
      ]}
    >
      <DataTable<AdEntry>
        searchPlaceholder="Search by routing source..."
        columns={[
          { key: 'source', label: 'Source' },
          { key: 'distance', label: 'Administrative distance', mono: true },
        ]}
        rows={administrativeDistances}
      />
      <div className="mt-6">
        <Aside>
          <p>
            These are Cisco's values, and the term "administrative distance" is Cisco's own. Juniper
            calls the same concept <em>route preference</em> and several of its defaults genuinely
            differ -- most notably BGP: Cisco trusts eBGP (20) far more than iBGP (200), while
            Juniper uses the identical preference (170) for both. OSPF splits the other way: Cisco
            treats every OSPF route the same (110), while Juniper distinguishes OSPF-internal (10)
            from OSPF-AS-external (150) routes.
          </p>
          <div className="mt-3 overflow-x-auto rounded-md border border-border/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg/40">
                <tr className="border-b border-border/60">
                  <th className="px-2 py-1.5 font-medium">Source</th>
                  <th className="px-2 py-1.5 font-medium">Cisco AD</th>
                  <th className="px-2 py-1.5 font-medium">Juniper preference</th>
                </tr>
              </thead>
              <tbody>
                {VENDOR_COMPARISON.map((entry) => (
                  <tr
                    key={entry.source}
                    className="border-b border-border/60 font-mono last:border-b-0"
                  >
                    <td className="px-2 py-1.5 font-sans">{entry.source}</td>
                    <td className="px-2 py-1.5">{entry.cisco}</td>
                    <td className="px-2 py-1.5">{entry.juniper}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Aside>
      </div>
      <ToolEducation
        howItWorks={
          <p>
            Administrative distance only matters when a router learns a route to the exact same
            network from two different sources at once -- it's a trust ranking between sources, not
            a measure of path quality within one source (that's what metric is for). Lower AD wins
            and gets installed; the higher-AD route to that same network still exists in the source
            protocol's own table, it's just not the one forwarding traffic.
          </p>
        }
        whenToUseThis={
          <p>
            Predicting which routing source wins when two are configured for the same network, or
            deliberately engineering that outcome -- a static route with a low AD to override
            whatever a dynamic protocol would otherwise install, or a high one to sit quietly in
            reserve.
          </p>
        }
        commonMistakes={
          <p>
            A high administrative distance isn't always a mistake -- a floating static route is a
            static route configured with an AD deliberately set higher than whatever dynamic
            protocol normally handles that network, so it stays completely inactive until the
            dynamic route disappears, then takes over as an automatic backup path. Seeing an
            unusually high AD on a static route is a design choice to look for, not necessarily a
            misconfiguration.
          </p>
        }
        relatedReading={
          <p>
            See this table actually decide a route in the{' '}
            <Link to="/tools/route-lookup-simulator" className="text-accent hover:underline">
              route lookup simulator
            </Link>
            .
          </p>
        }
      />
    </ReferencePageLayout>
  )
}

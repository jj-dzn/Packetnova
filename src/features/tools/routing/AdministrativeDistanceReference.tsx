import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import {
  administrativeDistances,
  type AdEntry,
} from '../../../content/reference/administrativeDistance'

export function AdministrativeDistanceReference() {
  return (
    <ReferencePageLayout
      category="Routing"
      title="Administrative distance reference"
      description="Default administrative distance for every routing source -- lower always wins when a router learns the same network from multiple sources."
    >
      <DataTable<AdEntry>
        searchPlaceholder="Search by routing source..."
        columns={[
          { key: 'source', label: 'Source' },
          { key: 'distance', label: 'Administrative distance', mono: true },
        ]}
        rows={administrativeDistances}
      />
    </ReferencePageLayout>
  )
}

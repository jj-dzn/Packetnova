import { ReferencePageLayout } from '../ReferencePageLayout'
import { DataTable } from '../../../components/ui/DataTable'
import { dnsRecordTypes, type DnsRecordEntry } from '../../../content/reference/dnsRecordTypes'

const RESOLUTION_STAGES = [
  { label: 'Root', caption: 'Resolver asks a root server: "who handles .com?"' },
  { label: 'TLD', caption: 'Root refers the resolver to the .com TLD servers' },
  {
    label: 'Authoritative',
    caption: "TLD refers the resolver to example.com's authoritative server",
  },
  { label: 'Answer', caption: 'The authoritative server returns the actual record' },
]

function ResolutionFlow() {
  return (
    <div className="mb-8 rounded-lg border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-medium">
        How a resolver finds any of the records above (recursive resolution)
      </p>
      <div className="flex flex-wrap items-stretch gap-2">
        {RESOLUTION_STAGES.map((stage, index) => (
          <div key={stage.label} className="flex items-stretch gap-2">
            <div className="flex w-36 flex-col gap-1 rounded-md border border-accent/30 bg-accent/5 p-2.5">
              <span className="font-mono text-sm font-medium text-accent">{stage.label}</span>
              <span className="text-xs text-fg-muted">{stage.caption}</span>
            </div>
            {index < RESOLUTION_STAGES.length - 1 && (
              <span className="flex items-center text-fg-subtle" aria-hidden="true">
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-fg-subtle">
        In practice this whole chain is cached aggressively at every level, so most lookups never
        touch the root or TLD servers at all -- this is the uncached, worst-case path.
      </p>
    </div>
  )
}

export function DnsRecordReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="DNS record reference"
      description="Every common DNS record type and what it's used for."
    >
      <ResolutionFlow />
      <DataTable<DnsRecordEntry>
        searchPlaceholder="Search by record type or description..."
        columns={[
          { key: 'type', label: 'Type', mono: true },
          { key: 'description', label: 'Description' },
          { key: 'example', label: 'Example', mono: true },
        ]}
        rows={dnsRecordTypes}
      />
    </ReferencePageLayout>
  )
}

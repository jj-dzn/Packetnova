import { useState } from 'react'
import { ReferencePageLayout } from '../ReferencePageLayout'
import { ToolEducation } from '../ToolEducation'
import { DataTable } from '../../../components/ui/DataTable'
import { Input } from '../../../components/ui/Input'
import { dnsRecordTypes, type DnsRecordEntry } from '../../../content/reference/dnsRecordTypes'

const DEFAULT_DOMAIN = 'example.com'

function buildResolutionStages(domain: string) {
  const trimmed = domain.trim().replace(/\.+$/, '') || DEFAULT_DOMAIN
  const labels = trimmed.split('.')
  const tld = labels.length > 1 ? labels[labels.length - 1] : 'com'

  return [
    { label: 'Root', caption: `Resolver asks a root server: "who handles .${tld}?"` },
    { label: 'TLD', caption: `Root refers the resolver to the .${tld} TLD servers` },
    {
      label: 'Authoritative',
      caption: `TLD refers the resolver to ${trimmed}'s authoritative server`,
    },
    { label: 'Answer', caption: 'The authoritative server returns the actual record' },
  ]
}

function ResolutionFlow() {
  const [domain, setDomain] = useState(DEFAULT_DOMAIN)
  const stages = buildResolutionStages(domain)

  return (
    <div className="mb-8 rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          How a resolver finds any of the records above (recursive resolution)
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="dns-flow-domain" className="text-xs text-fg-muted">
            Domain
          </label>
          <Input
            id="dns-flow-domain"
            className="w-48"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-stretch gap-2">
        {stages.map((stage, index) => (
          <div key={stage.label} className="flex items-stretch gap-2">
            <div className="flex w-36 flex-col gap-1 rounded-md border border-accent/30 bg-accent/5 p-2.5">
              <span className="font-mono text-sm font-medium text-accent">{stage.label}</span>
              <span className="text-xs text-fg-muted">{stage.caption}</span>
            </div>
            {index < stages.length - 1 && (
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
      related={[
        {
          to: '/scenarios/dns-negative-cache',
          label: 'Scenario: DNS that works everywhere except one network',
        },
      ]}
    >
      <ResolutionFlow />
      <DataTable<DnsRecordEntry>
        searchPlaceholder="Search by record type or description..."
        columns={[
          { key: 'type', label: 'Type', mono: true },
          { key: 'description', label: 'Description' },
          { key: 'example', label: 'Example', mono: true },
          { key: 'rfc', label: 'RFC', mono: true },
        ]}
        rows={dnsRecordTypes}
      />
      <ToolEducation
        howItWorks={
          <p>
            Every record has a type (what kind of answer it is), a TTL in seconds (how long any
            resolver may cache it before asking again), and the actual data. TTL applies uniformly
            to whichever record it's attached to -- there's no separate mechanism governing how long
            an answer stays cached beyond the number sitting right there in the record.
          </p>
        }
        whenToUseThis={
          <p>
            Picking the right record type for what you're actually trying to point somewhere -- an
            A/AAAA record for a bare IP mapping, CNAME for aliasing one name to another, MX for mail
            routing -- or looking up what a record type you've encountered in a zone file actually
            does.
          </p>
        }
        commonMistakes={
          <p>
            A CNAME can't coexist with any other record at the same name -- RFC 1034 requires that
            if a name has a CNAME, that's the only record it's allowed to have, which is exactly why
            a zone apex (the bare domain itself, which also needs SOA and NS records) can't usually
            be CNAME'd directly to a CDN; providers work around this with a proprietary
            apex-flattening feature, not by breaking the rule. TTL set too low is the other classic
            mistake -- it doesn't just mean fresher answers, it means every resolver on the internet
            re-queries far more often, and a popular record with an aggressively low TTL can
            genuinely overload an authoritative server with repeat traffic. And that trailing dot in
            the example rows above isn't a typo -- it marks the name as fully qualified (anchored at
            the root), which matters most inside zone files, where a name written without it gets
            the zone's own origin silently appended.
          </p>
        }
      />
    </ReferencePageLayout>
  )
}

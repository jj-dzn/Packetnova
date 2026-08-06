import { ReferencePageLayout } from '../ReferencePageLayout'
import { ToolEducation } from '../ToolEducation'
import { RfcFootnote } from '../RfcFootnote'
import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { httpStatusCodes, type HttpStatusEntry } from '../../../content/reference/httpStatusCodes'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const CLASS_INFO: Record<number, { label: string; tone: BadgeTone }> = {
  1: { label: '1xx Informational', tone: 'neutral' },
  2: { label: '2xx Success', tone: 'success' },
  3: { label: '3xx Redirection', tone: 'accent' },
  4: { label: '4xx Client Error', tone: 'warning' },
  5: { label: '5xx Server Error', tone: 'danger' },
}

export function HttpStatusReference() {
  return (
    <ReferencePageLayout
      category="Protocols"
      title="HTTP status reference"
      description="Look up any common HTTP status code and what it means."
    >
      <DataTable<HttpStatusEntry>
        searchPlaceholder="Search by code, name, or description..."
        columns={[
          { key: 'code', label: 'Code', mono: true },
          {
            key: 'code',
            id: 'class',
            label: 'Class',
            render: (row) => {
              const info = CLASS_INFO[Math.floor(row.code / 100)]
              return info ? <Badge tone={info.tone}>{info.label}</Badge> : null
            },
          },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
        ]}
        rows={httpStatusCodes}
      />
      <RfcFootnote>
        Defined in RFC 9110 (HTTP Semantics) -- the current consolidated specification, obsoleting
        RFC 7231 and the older RFC 2616.
      </RfcFootnote>
      <ToolEducation
        howItWorks={
          <p>
            The leading digit sets the class -- 2xx succeeded, 3xx redirects somewhere else, 4xx
            says the client got something wrong, 5xx says the server did -- and the two digits after
            it narrow down exactly what happened within that class.
          </p>
        }
        commonMistakes={
          <p>
            Returning 404 for an authentication or authorization failure instead of 401 or 403 -- a
            resource that exists but you can't access it should say so, not pretend the resource was
            never there (401 means "log in first"; 403 means "you're identified, but this is still
            not yours to see"). The other classic mix-up is 301 versus 302: a 301 tells clients and
            search engines the move is permanent and safe to cache indefinitely, so using it for
            what's actually a temporary redirect (302, or 307 if the method and body must be
            preserved) can get the old URL cached as gone long after it's back.
          </p>
        }
      />
    </ReferencePageLayout>
  )
}

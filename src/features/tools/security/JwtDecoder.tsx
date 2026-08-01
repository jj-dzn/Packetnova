import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { CopyButton } from '../../../components/ui/CopyButton'
import { Badge } from '../../../components/ui/Badge'
import { Pill } from '../../../components/ui/Pill'
import { decodeJwt, inspectJwt } from '../../../lib/calculations/jwt'

const DEFAULT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

type Mode = 'raw' | 'summary'

// Merged from the former separate "JWT decoder" and "JWT inspector" tools --
// both parsed the same token, just rendered it differently (raw
// header/payload JSON vs. a summarized claims view), so a mode toggle over
// one input replaces what used to be two near-duplicate pages.
export function JwtDecoder() {
  const [token, setToken] = useState(DEFAULT_TOKEN)
  const [mode, setMode] = useState<Mode>('raw')

  return (
    <ToolPageLayout
      category="Security"
      title="JWT decoder"
      description="Decode a JWT's header and payload, or switch to a summary of its claims -- entirely client-side, and without verifying the signature."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Pill active={mode === 'raw'} onClick={() => setMode('raw')}>
              Raw
            </Pill>
            <Pill active={mode === 'summary'} onClick={() => setMode('summary')}>
              Summary
            </Pill>
          </div>
          <div>
            <label htmlFor="jwt-decoder-input" className="text-sm font-medium">
              Token
            </label>
            <textarea
              id="jwt-decoder-input"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={8}
              spellCheck={false}
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-fg focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      }
      result={mode === 'raw' ? <RawResult token={token} /> : <SummaryResult token={token} />}
    />
  )
}

function RawResult({ token }: { token: string }) {
  const calc = decodeJwt(token)
  if (!calc.ok) return <p className="text-sm text-danger">{calc.error}</p>

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-fg-muted">Header</p>
          <CopyButton value={JSON.stringify(calc.result.header, null, 2)} label="header" />
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
          {JSON.stringify(calc.result.header, null, 2)}
        </pre>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-fg-muted">Payload</p>
          <CopyButton value={JSON.stringify(calc.result.payload, null, 2)} label="payload" />
        </div>
        <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
          {JSON.stringify(calc.result.payload, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function SummaryResult({ token }: { token: string }) {
  const calc = inspectJwt(token)
  if (!calc.ok) return <p className="text-sm text-danger">{calc.error}</p>

  return (
    <div className="flex flex-col gap-3">
      {calc.result.isExpired !== null && (
        <Badge tone={calc.result.isExpired ? 'danger' : 'success'}>
          {calc.result.isExpired ? 'Expired' : 'Not expired'}
        </Badge>
      )}
      <dl>
        <ResultRow label="Algorithm" value={calc.result.algorithm ?? '(none)'} />
        <ResultRow label="Type" value={calc.result.tokenType ?? '(none)'} />
        <ResultRow label="Subject" value={calc.result.subject ?? '(none)'} />
        <ResultRow label="Issuer" value={calc.result.issuer ?? '(none)'} />
        <ResultRow label="Issued at" value={calc.result.issuedAt ?? '(none)'} />
        <ResultRow label="Expires at" value={calc.result.expiresAt ?? '(none)'} />
      </dl>
    </div>
  )
}

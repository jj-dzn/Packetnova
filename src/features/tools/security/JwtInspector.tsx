import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Badge } from '../../../components/ui/Badge'
import { inspectJwt } from '../../../lib/calculations/jwt'

const DEFAULT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtInspector() {
  const [token, setToken] = useState(DEFAULT_TOKEN)

  const calc = inspectJwt(token)

  return (
    <ToolPageLayout
      category="Security"
      title="JWT inspector"
      description="See a JWT's algorithm, claims, and expiration status at a glance."
      input={
        <div>
          <label htmlFor="jwt-inspector-input" className="text-sm font-medium">
            Token
          </label>
          <textarea
            id="jwt-inspector-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={8}
            spellCheck={false}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        calc.ok ? (
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
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

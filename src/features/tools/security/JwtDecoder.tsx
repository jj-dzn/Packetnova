import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { decodeJwt } from '../../../lib/calculations/jwt'

const DEFAULT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export function JwtDecoder() {
  const [token, setToken] = useState(DEFAULT_TOKEN)

  const calc = decodeJwt(token)

  return (
    <ToolPageLayout
      category="Security"
      title="JWT decoder"
      description="Decode a JWT's header and payload -- entirely client-side, and without verifying the signature."
      input={
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
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-fg-muted">Header</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                {JSON.stringify(calc.result.header, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-fg-muted">Payload</p>
              <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                {JSON.stringify(calc.result.payload, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

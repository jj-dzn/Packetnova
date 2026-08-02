import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { SecurityWarning } from '../SecurityWarning'
import { Aside } from '../Aside'
import { CopyButton } from '../../../components/ui/CopyButton'
import { Badge } from '../../../components/ui/Badge'
import { Pill } from '../../../components/ui/Pill'
import { decodeJwt, inspectJwt, type JwtInspection } from '../../../lib/calculations/jwt'
import type { CalculationResult } from '../../../lib/calculations/result'

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
  const inspection = inspectJwt(token)

  return (
    <ToolPageLayout
      category="Security"
      title="JWT decoder"
      description="Decode a JWT's header and payload, or switch to a summary of its claims -- entirely client-side, and without verifying the signature."
      related={[
        { to: '/tools/base64-encode-decode', label: 'Base64 encode/decode' },
        { to: '/tools/url-encode-decode', label: 'URL encode/decode' },
      ]}
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
            <ColorizedToken token={token} />
          </div>
        </div>
      }
      result={
        <div className="flex flex-col gap-4">
          <Aside>
            The token itself is three base64url-encoded segments joined by dots -- base64url, not
            standard base64, so "+" and "/" are replaced with "-" and "_" and padding is dropped,
            which is why it won't decode cleanly in a plain base64 tool. Inside the header and
            payload, "alg" is the signing algorithm, "typ" is almost always "JWT", and "iat" (issued
            at), "exp" (expires), and "nbf" (not valid before) are all Unix timestamps in seconds,
            not milliseconds.
          </Aside>
          {inspection.ok && inspection.result.isUnsigned && (
            <SecurityWarning>
              This token is unsigned -- its header declares alg "none", or its signature segment is
              empty. Anyone could have created this token with any payload they wanted. A server
              that accepts it without independently rejecting unsigned tokens is exposed to the
              classic "alg: none" forgery attack.
            </SecurityWarning>
          )}
          {mode === 'raw' ? <RawResult token={token} /> : <SummaryResult inspection={inspection} />}
        </div>
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            A JWT is three base64url segments -- header, payload, signature -- joined by dots.
            Decoding the header and payload is just reversing that encoding, which is public and
            reversible by design; that's why this tool can show you the contents without ever
            touching a server. The signature is the part that actually proves the token wasn't
            tampered with, and verifying it requires the issuer's secret or public key, which this
            tool deliberately never asks for or has.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to inspect what's actually inside a token you already have -- debugging why an
            API call is being rejected, checking an expiry claim, or confirming a token has the
            claims your application expects. It's not a substitute for real verification: a backend
            deciding whether to trust a token must check the signature against the correct key, not
            just look at what the payload claims.
          </p>
        }
        commonMistakes={
          <p>
            Treating a decoded-but-unverified payload as trustworthy -- anyone can construct a JWT
            with any header and payload they like; only a valid signature check (which this tool
            doesn't perform) proves it came from who it claims to. Also worth knowing: "iat", "exp",
            and "nbf" are Unix timestamps in seconds, not milliseconds, a common off-by-1000x
            mistake when comparing them against JavaScript's millisecond-based{' '}
            <code className="font-mono">Date.now()</code>.
          </p>
        }
        troubleshootingTips={
          <p>
            If pasting a token here fails to decode, check for accidental whitespace or line breaks
            introduced by copying from a terminal or log line -- JWTs are single unbroken strings.
            If a token looks valid here but your application still rejects it, the problem is almost
            always signature verification or an expired/not-yet-valid timestamp, not the encoding
            itself.
          </p>
        }
        relatedReading={
          <p>
            JWT segments are base64url, the same encoding used by many URL-safe tokens --{' '}
            <Link to="/tools/base64-encode-decode" className="text-accent hover:underline">
              Base64 encode/decode
            </Link>{' '}
            covers the standard variant.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

const SEGMENT_TINTS = [
  { name: 'Header', bg: 'bg-accent/20', text: 'text-accent' },
  { name: 'Payload', bg: 'bg-accent-alt/20', text: 'text-accent-alt' },
  { name: 'Signature', bg: 'bg-warning/20', text: 'text-warning' },
]

// jwt.io's signature visual for a JWT: the three dot-separated segments
// colored distinctly right in the input, so "this is three separate
// base64url chunks joined by dots" is visible before reading a word of the
// explanation below. Colors any segments beyond the first three neutrally --
// a token with more than two dots is malformed, but still worth showing as
// segments rather than silently truncating.
function ColorizedToken({ token }: { token: string }) {
  const segments = token.trim().split('.')
  if (segments.length < 2 || segments.every((s) => s === '')) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-0.5 gap-y-1 break-all rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs">
      {segments.map((segment, i) => {
        const tint = SEGMENT_TINTS[i]
        return (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="text-fg-subtle">.</span>}
            <span
              className={tint ? `rounded px-0.5 ${tint.bg} ${tint.text}` : 'text-fg-subtle'}
              title={tint?.name ?? 'Unexpected extra segment'}
            >
              {segment || '​'}
            </span>
          </span>
        )
      })}
    </div>
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

function SummaryResult({ inspection: calc }: { inspection: CalculationResult<JwtInspection> }) {
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

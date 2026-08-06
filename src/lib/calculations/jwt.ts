import type { CalculationResult } from './result'

export interface JwtDecoded {
  header: unknown
  payload: unknown
  signature: string
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = padded.length % 4 === 0 ? 0 : 4 - (padded.length % 4)
  return atob(padded + '='.repeat(padLength))
}

// A forged/malformed token can carry an exp/iat far outside the range
// Date can represent (+-8,640,000,000,000ms from epoch) -- toISOString()
// throws RangeError rather than returning an invalid-but-usable value, so
// this has to be checked before formatting instead of just try/caught.
function unixSecondsToIsoString(seconds: number): string | null {
  const date = new Date(seconds * 1000)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function decodeJwt(token: string): CalculationResult<JwtDecoded> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    return {
      ok: false,
      error: 'A JWT must have three dot-separated parts: header.payload.signature.',
    }
  }

  const [headerPart, payloadPart, signaturePart] = parts as [string, string, string]

  try {
    const header: unknown = JSON.parse(base64UrlDecode(headerPart))
    const payload: unknown = JSON.parse(base64UrlDecode(payloadPart))
    return { ok: true, result: { header, payload, signature: signaturePart } }
  } catch {
    return {
      ok: false,
      error: 'Could not decode this token -- header and payload must be valid base64url JSON.',
    }
  }
}

export interface JwtInspection {
  algorithm: string | null
  tokenType: string | null
  issuedAt: string | null
  expiresAt: string | null
  isExpired: boolean | null
  subject: string | null
  issuer: string | null
  /** True if this token isn't actually protected by a signature -- either
   * the header declares alg "none" (the classic forgery bypass: a server
   * that doesn't independently reject it will accept a token with any
   * payload an attacker wants), or the signature segment is empty
   * regardless of what alg claims. Detectable from the token alone, unlike
   * e.g. algorithm-confusion attacks, which depend on server-side key
   * configuration this tool has no visibility into. */
  isUnsigned: boolean
}

export function inspectJwt(token: string): CalculationResult<JwtInspection> {
  const decoded = decodeJwt(token)
  if (!decoded.ok) return decoded

  const header = decoded.result.header as Record<string, unknown>
  const payload = decoded.result.payload as Record<string, unknown>

  const exp = typeof payload.exp === 'number' ? payload.exp : null
  const iat = typeof payload.iat === 'number' ? payload.iat : null
  const algorithm = typeof header.alg === 'string' ? header.alg : null

  return {
    ok: true,
    result: {
      algorithm,
      tokenType: typeof header.typ === 'string' ? header.typ : null,
      issuedAt: iat !== null ? unixSecondsToIsoString(iat) : null,
      expiresAt: exp !== null ? unixSecondsToIsoString(exp) : null,
      isExpired: exp !== null ? Date.now() > exp * 1000 : null,
      subject: typeof payload.sub === 'string' ? payload.sub : null,
      issuer: typeof payload.iss === 'string' ? payload.iss : null,
      isUnsigned:
        algorithm?.trim().toLowerCase() === 'none' || decoded.result.signature.trim() === '',
    },
  }
}

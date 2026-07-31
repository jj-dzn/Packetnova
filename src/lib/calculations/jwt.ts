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
}

export function inspectJwt(token: string): CalculationResult<JwtInspection> {
  const decoded = decodeJwt(token)
  if (!decoded.ok) return decoded

  const header = decoded.result.header as Record<string, unknown>
  const payload = decoded.result.payload as Record<string, unknown>

  const exp = typeof payload.exp === 'number' ? payload.exp : null
  const iat = typeof payload.iat === 'number' ? payload.iat : null

  return {
    ok: true,
    result: {
      algorithm: typeof header.alg === 'string' ? header.alg : null,
      tokenType: typeof header.typ === 'string' ? header.typ : null,
      issuedAt: iat !== null ? new Date(iat * 1000).toISOString() : null,
      expiresAt: exp !== null ? new Date(exp * 1000).toISOString() : null,
      isExpired: exp !== null ? Date.now() > exp * 1000 : null,
      subject: typeof payload.sub === 'string' ? payload.sub : null,
      issuer: typeof payload.iss === 'string' ? payload.iss : null,
    },
  }
}

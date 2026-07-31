import { describe, expect, it } from 'vitest'
import { decodeJwt, inspectJwt } from './jwt'

// The canonical jwt.io example token -- independently decoded via Node's
// Buffer.from(part, 'base64url') before being used here, not hand-encoded
// by the same code being tested.
const EXAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('decodeJwt', () => {
  it('decodes the canonical example token header and payload', () => {
    const result = decodeJwt(EXAMPLE_TOKEN)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.header).toEqual({ alg: 'HS256', typ: 'JWT' })
    expect(result.result.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 })
  })

  it('rejects a token without three parts', () => {
    expect(decodeJwt('not.a.jwt.token').ok).toBe(false)
    expect(decodeJwt('only-one-part').ok).toBe(false)
  })

  it('rejects a token with invalid base64url JSON', () => {
    expect(decodeJwt('not-valid.not-valid.signature').ok).toBe(false)
  })
})

describe('inspectJwt', () => {
  it('extracts algorithm, type, subject, and issued-at from the example token', () => {
    const result = inspectJwt(EXAMPLE_TOKEN)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.algorithm).toBe('HS256')
    expect(result.result.tokenType).toBe('JWT')
    expect(result.result.subject).toBe('1234567890')
    expect(result.result.issuedAt).toBe(new Date(1516239022 * 1000).toISOString())
  })

  it('has no expiration info when the token has no exp claim', () => {
    const result = inspectJwt(EXAMPLE_TOKEN)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.expiresAt).toBeNull()
    expect(result.result.isExpired).toBeNull()
  })

  it('correctly flags an expired token', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ exp: 1000000000 })) // long in the past
    const token = `${header}.${payload}.signature`
    const result = inspectJwt(token)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isExpired).toBe(true)
  })

  it('correctly flags a token that is not yet expired', () => {
    const farFuture = Math.floor(Date.now() / 1000) + 1_000_000
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({ exp: farFuture }))
    const token = `${header}.${payload}.signature`
    const result = inspectJwt(token)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isExpired).toBe(false)
  })
})

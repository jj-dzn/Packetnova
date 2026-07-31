import { describe, expect, it } from 'vitest'
import { parseCertificate } from './certificate'

// A real self-signed certificate generated with:
//   openssl req -x509 -newkey rsa:2048 -days 365 -nodes -sha256 \
//     -subj "/C=US/O=PacketNova Test/CN=packetnova.test" \
//     -addext "subjectAltName=DNS:packetnova.test,DNS:www.packetnova.test"
//
// Ground truth below is `openssl x509 -in cert.pem -noout -text` output --
// an independent tool, not this parser -- so this is real verification,
// not the parser checking its own encoding.
const TEST_CERT = `-----BEGIN CERTIFICATE-----
MIIDljCCAn6gAwIBAgIUf0CW8fHbISo/2Lxa7hYw380RJYEwDQYJKoZIhvcNAQEL
BQAwQTELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD1BhY2tldE5vdmEgVGVzdDEYMBYG
A1UEAwwPcGFja2V0bm92YS50ZXN0MB4XDTI2MDczMTAyNDMwNloXDTI3MDczMTAy
NDMwNlowQTELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD1BhY2tldE5vdmEgVGVzdDEY
MBYGA1UEAwwPcGFja2V0bm92YS50ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A
MIIBCgKCAQEAseaNyO2j9cPyTZP5rV657RmaSm4+t+8BtT4LRyMTk0FAcG2YD4Wq
mbnwuJ+SAu/IQlvbrmV/8m5M93v7+kMRieERwoRobM2hryP99kf95vgcPHVU/doO
VCtMis02BHtceliFlEZsmDdXHuieeZWTpzZZnD3QGPxIO8zyvCCuAHc8AHiDUiwf
ezhNM4hrZyDrbNVKO/08snndhDINaqaLtgQW3NrZ0RbqSnQtm+7ViOZraFHukaNu
RLhdVMTIcsodaWNmoj3kAmxLd2wysyAIJFLRlTnh19PTK4yoUIoSb2qzb9bcyfD5
ilnueBPpEa54kVL8orc20AnMAy4o/aHhswIDAQABo4GFMIGCMB0GA1UdDgQWBBTX
1YDtAzbiYHTL1ZjldSuTCDIySjAfBgNVHSMEGDAWgBTX1YDtAzbiYHTL1ZjldSuT
CDIySjAPBgNVHRMBAf8EBTADAQH/MC8GA1UdEQQoMCaCD3BhY2tldG5vdmEudGVz
dIITd3d3LnBhY2tldG5vdmEudGVzdDANBgkqhkiG9w0BAQsFAAOCAQEAHwHQVl0d
gADBzRfguPjKS8v6T5VmgM2gIhNZ6m/xXsdFUKvxACmoFW+gV+Kf9T7vfjSAP50y
GUiin6+ZxBq5hkVr1edzOk78QuEqzY9FJg33VM7Tf0hrOXTsQnXLdxzY1zShhBxe
1vQWJqOdJllw3+X+s+0wYB3JitnLLcR3XUWAjRaiCLYQk+GdchTM77T0kYN4I/e9
iHWPPamd/gJaGDzTktVfBZN+LfRDNXaWXJcKZaeN493kHr6yIsTNSTXT77eGJb1v
ck54ZWyHiOKTXJXq+bYspyYhBDoc3FD9SERc8PFJlQZeGuMrOgbPkdoJy55OqXby
Yd+NGk9YHk7gug==
-----END CERTIFICATE-----`

describe('parseCertificate', () => {
  it('parses version 3', () => {
    const result = parseCertificate(TEST_CERT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.version).toBe(3)
  })

  it('parses the serial number matching openssl exactly', () => {
    const result = parseCertificate(TEST_CERT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.serialNumber).toBe(
      '7f:40:96:f1:f1:db:21:2a:3f:d8:bc:5a:ee:16:30:df:cd:11:25:81',
    )
  })

  it('parses the signature algorithm', () => {
    const result = parseCertificate(TEST_CERT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.signatureAlgorithm).toBe('sha256WithRSAEncryption')
  })

  it('parses issuer and subject (self-signed, so identical)', () => {
    const result = parseCertificate(TEST_CERT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.issuer).toEqual({ C: 'US', O: 'PacketNova Test', CN: 'packetnova.test' })
    expect(result.result.subject).toEqual({ C: 'US', O: 'PacketNova Test', CN: 'packetnova.test' })
  })

  it('parses validity dates matching openssl exactly (Jul 31 02:43:06 2026/2027 GMT)', () => {
    const result = parseCertificate(TEST_CERT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.notBefore.toISOString()).toBe(
      new Date(Date.UTC(2026, 6, 31, 2, 43, 6)).toISOString(),
    )
    expect(result.result.notAfter.toISOString()).toBe(
      new Date(Date.UTC(2027, 6, 31, 2, 43, 6)).toISOString(),
    )
  })

  it('parses both subject alternative names', () => {
    const result = parseCertificate(TEST_CERT)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.subjectAltNames).toEqual(['packetnova.test', 'www.packetnova.test'])
  })

  it('is neither expired nor not-yet-valid partway through its validity window', () => {
    // Fixed reference time rather than the real clock: the cert is valid
    // Jul 31 2026 -- Jul 31 2027, and comparing against `new Date()` made
    // this test's outcome depend on whatever day it happened to run,
    // which is fine on a machine whose clock matches that window but
    // silently flips to isNotYetValid once run somewhere (e.g. CI) whose
    // clock doesn't.
    const midWindow = new Date(Date.UTC(2027, 0, 1))
    const result = parseCertificate(TEST_CERT, midWindow)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isExpired).toBe(false)
    expect(result.result.isNotYetValid).toBe(false)
  })

  it('reports isNotYetValid before the validity window starts', () => {
    const beforeWindow = new Date(Date.UTC(2020, 0, 1))
    const result = parseCertificate(TEST_CERT, beforeWindow)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isNotYetValid).toBe(true)
    expect(result.result.isExpired).toBe(false)
  })

  it('reports isExpired after the validity window ends', () => {
    const afterWindow = new Date(Date.UTC(2028, 0, 1))
    const result = parseCertificate(TEST_CERT, afterWindow)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.result.isExpired).toBe(true)
    expect(result.result.isNotYetValid).toBe(false)
  })

  it('rejects text that is not a PEM certificate', () => {
    expect(parseCertificate('not a certificate').ok).toBe(false)
  })
})

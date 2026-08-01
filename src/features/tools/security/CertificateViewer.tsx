import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Badge } from '../../../components/ui/Badge'
import { CopyButton } from '../../../components/ui/CopyButton'
import {
  parseCertificate,
  splitPemCertificates,
  type CertificateInfo,
} from '../../../lib/calculations/certificate'
import type { CalculationResult } from '../../../lib/calculations/result'

// A real leaf -> root chain (openssl-generated), not two unrelated single
// certs pasted together, so the issuer/subject linkage in the chain view
// below is genuinely meaningful out of the box.
const EXAMPLE_CERT_CHAIN = `-----BEGIN CERTIFICATE-----
MIIDhjCCAm6gAwIBAgIUVxUVOObh8LeTwcuEgnHGEl4zYw4wDQYJKoZIhvcNAQEL
BQAwRDELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD1BhY2tldE5vdmEgVGVzdDEbMBkG
A1UEAwwSUGFja2V0Tm92YSBSb290IENBMB4XDTI2MDgwMTAxMDgxOFoXDTI4MTEw
MzAxMDgxOFowQTELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD1BhY2tldE5vdmEgVGVz
dDEYMBYGA1UEAwwPcGFja2V0bm92YS50ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOC
AQ8AMIIBCgKCAQEA8CxLXFw5jk+N5VWZ04dQRxT/1vv5DYSu9RVlcm4Ps0cVLedy
KNGbIkDDSKGWbbmiX7Y1l4keyjrlVwL3eTKSKPSrFK0WJH8ShKAfSmJ8rs90UfC7
3WCmIZ04kEMVEl36sXrr6sICkXfOZ5/6MuUHTd4ocUO5e4paAtlM5zeLQyuCmpIh
MF4UI0YBHPlNglPnylosREq0efwl6mWTOpjCsUeaU+ImbCS8Z3bLyIUE1jqyU5KS
5D7Lo+CHJ0yo49tIFmzhdw+CT+0fMA41dUMCz9KKyizpxoWuvR5kIxV8X3QnQkqA
2noXlRvpsRkA7iW390AUDc7BTuNvOlVQtcZCYQIDAQABo3MwcTAvBgNVHREEKDAm
gg9wYWNrZXRub3ZhLnRlc3SCE3d3dy5wYWNrZXRub3ZhLnRlc3QwHQYDVR0OBBYE
FKzNftcUAEfWdU4b2CtDB7eFKuqrMB8GA1UdIwQYMBaAFPx+sooq/xmPghdjkjbL
Oa76PzkXMA0GCSqGSIb3DQEBCwUAA4IBAQA1J6mNglGTn7IIb+wZ4C2+qEdKwrNn
htqG+zxWDJqZWVirg4+0N2i7yFOGaZZ47m6jQa6GjzVK5yKjM17u288MAqUlj2fD
/V5shv6aBRmrmb0jSkrj+x78J40X2oV99p1x3PTm6edI6HN/RWiLQK35owZB1fpp
8ccQf1tr08C52lJLupainDs/aWHL06NMN/NPtuguLoICAR4G4p2yZRKbapab67y/
fM77s7083+9uykk15cgyJuEuaUl6ZUoBvXBgic2zXgck63d8P2SNiI/Af5U8GgQN
pSNrSEDWoQyZwDj+UfA+j8LputgMVl0OxgivzOwbc2AAcMdJU7/puYnk
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIIDaTCCAlGgAwIBAgIUQn5YpaiYiwgnZL+u0zXK1hX7hPcwDQYJKoZIhvcNAQEL
BQAwRDELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD1BhY2tldE5vdmEgVGVzdDEbMBkG
A1UEAwwSUGFja2V0Tm92YSBSb290IENBMB4XDTI2MDgwMTAxMDgxOFoXDTM2MDcy
OTAxMDgxOFowRDELMAkGA1UEBhMCVVMxGDAWBgNVBAoMD1BhY2tldE5vdmEgVGVz
dDEbMBkGA1UEAwwSUGFja2V0Tm92YSBSb290IENBMIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEAqv7z6EOnzfi+WLR1tvEElTdaajMQAP5ckAeV8Nddkg2k
rbnvE6P3RbL/H90d0uK8PLbtrNqtSbE1oxO/DQOZLUBcEyZPDnhgDFLi5moQQb6I
vwsy33aUX0CAlwkOu04j5FDSuQLSLn3ZZ3A8xLnte46z1mGRyBzqNO1j3q9gumLc
3rlwjm26hs4EVLobYCOcV2WjkOjPEDtqBbvdjodG9fchnpknqmn8aqMbJahTruHp
gRyDkBRJJWppN3TjelojKmBjdlDfFKZyD0yUk4gkGi+F/Ec6muy31nHax+Bxbuxv
DOZSsGM6vtYa6DfIgY8WcWRZtTIoODHWI+HhHjA2rwIDAQABo1MwUTAdBgNVHQ4E
FgQU/H6yiir/GY+CF2OSNss5rvo/ORcwHwYDVR0jBBgwFoAU/H6yiir/GY+CF2OS
Nss5rvo/ORcwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEARn8j
qDBL09fjmUdl/vQf14+04OMNKJ+4QZJi4iJaNh2YdMoqI3GLVRQajGM+u8Zqr8kI
f9A59JZIN8+C/qwZasiPo9cn5kE7g/h8iJs3Rhz+cULa1gAMYRtAoFYuOB5pxysk
oOjBrKtT53RQch47M+eMH6GjcLoZeqqh7U848ovuDYODA40jYOTwHKaLwpB4gn6+
2Qy3dr4+gbDDsxQcy/3N5p2jIaRFFjKTDNSUvj4U70y2AJDWcRRjkBFBQWMA9rzZ
jJUxv1O20jWCdvOclARZDWiS4BSFY3fgZAt1RDs+dWhfoOghv/BqW49Sr47VISje
b4p1y/uVqQ3xF2AMnA==
-----END CERTIFICATE-----`

function isSelfSigned(cert: CertificateInfo): boolean {
  return JSON.stringify(cert.subject) === JSON.stringify(cert.issuer)
}

function chainLabel(index: number, total: number, cert: CertificateInfo): string {
  if (total === 1) return 'Certificate'
  if (index === 0) return 'Leaf'
  if (index === total - 1 && isSelfSigned(cert)) return 'Root CA'
  if (index === total - 1) return 'Issuer'
  return `Intermediate ${index}`
}

function formatName(name: Record<string, string>): string {
  return ['CN', 'O', 'OU', 'L', 'ST', 'C']
    .filter((key) => name[key])
    .map((key) => `${key}=${name[key]}`)
    .join(', ')
}

export function CertificateViewer() {
  const [pem, setPem] = useState(EXAMPLE_CERT_CHAIN)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const blocks = splitPemCertificates(pem)
  const certResults: CalculationResult<CertificateInfo>[] =
    blocks.length > 0 ? blocks.map((block) => parseCertificate(block)) : [parseCertificate(pem)]
  const safeIndex = Math.min(selectedIndex, certResults.length - 1)
  const selected = certResults[safeIndex]!

  return (
    <ToolPageLayout
      category="Security"
      title="Certificate viewer"
      description="Inspect an X.509 certificate's fields, SANs, and validity dates -- parsed entirely client-side, nothing uploaded. Paste a full chain (leaf, intermediates, root) to inspect each one."
      input={
        <div>
          <label htmlFor="cert-input" className="text-sm font-medium">
            PEM certificate or chain
          </label>
          <textarea
            id="cert-input"
            value={pem}
            onChange={(e) => {
              setPem(e.target.value)
              setSelectedIndex(0)
            }}
            rows={16}
            spellCheck={false}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        <div className="flex flex-col gap-4">
          {certResults.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {certResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    index === safeIndex
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-fg-muted hover:text-fg'
                  }`}
                >
                  {result.ok
                    ? chainLabel(index, certResults.length, result.result)
                    : `Certificate ${index + 1}`}
                </button>
              ))}
            </div>
          )}
          {selected.ok ? (
            <div className="flex flex-col gap-3">
              {selected.result.isExpired && <Badge tone="danger">Expired</Badge>}
              {selected.result.isNotYetValid && <Badge tone="warning">Not yet valid</Badge>}
              {!selected.result.isExpired && !selected.result.isNotYetValid && (
                <Badge tone="success">Currently valid</Badge>
              )}
              <dl>
                <ResultRow label="Version" value={String(selected.result.version)} />
                <ResultRow label="Serial number" value={selected.result.serialNumber} />
                <ResultRow label="Signature algorithm" value={selected.result.signatureAlgorithm} />
                <ResultRow label="Subject" value={formatName(selected.result.subject)} />
                <ResultRow label="Issuer" value={formatName(selected.result.issuer)} />
                <ResultRow label="Not before" value={selected.result.notBefore.toUTCString()} />
                <ResultRow label="Not after" value={selected.result.notAfter.toUTCString()} />
              </dl>
              {selected.result.subjectAltNames.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-fg-muted">
                    Subject Alternative Names
                  </p>
                  <ul className="flex flex-col gap-1 font-mono text-sm">
                    {selected.result.subjectAltNames.map((san) => (
                      <li
                        key={san}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-1.5"
                      >
                        <span className="min-w-0 break-all">{san}</span>
                        <CopyButton value={san} label="SAN" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-danger">{selected.error}</p>
          )}
        </div>
      }
    />
  )
}

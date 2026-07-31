import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Badge } from '../../../components/ui/Badge'
import { CopyButton } from '../../../components/ui/CopyButton'
import { parseCertificate } from '../../../lib/calculations/certificate'

const EXAMPLE_CERT = `-----BEGIN CERTIFICATE-----
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

function formatName(name: Record<string, string>): string {
  return ['CN', 'O', 'OU', 'L', 'ST', 'C']
    .filter((key) => name[key])
    .map((key) => `${key}=${name[key]}`)
    .join(', ')
}

export function CertificateViewer() {
  const [pem, setPem] = useState(EXAMPLE_CERT)

  const calc = parseCertificate(pem)

  return (
    <ToolPageLayout
      category="Security"
      title="Certificate viewer"
      description="Inspect an X.509 certificate's fields, SANs, and validity dates -- parsed entirely client-side, nothing uploaded."
      input={
        <div>
          <label htmlFor="cert-input" className="text-sm font-medium">
            PEM certificate
          </label>
          <textarea
            id="cert-input"
            value={pem}
            onChange={(e) => setPem(e.target.value)}
            rows={16}
            spellCheck={false}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-3">
            {calc.result.isExpired && <Badge tone="danger">Expired</Badge>}
            {calc.result.isNotYetValid && <Badge tone="warning">Not yet valid</Badge>}
            {!calc.result.isExpired && !calc.result.isNotYetValid && (
              <Badge tone="success">Currently valid</Badge>
            )}
            <dl>
              <ResultRow label="Version" value={String(calc.result.version)} />
              <ResultRow label="Serial number" value={calc.result.serialNumber} />
              <ResultRow label="Signature algorithm" value={calc.result.signatureAlgorithm} />
              <ResultRow label="Subject" value={formatName(calc.result.subject)} />
              <ResultRow label="Issuer" value={formatName(calc.result.issuer)} />
              <ResultRow label="Not before" value={calc.result.notBefore.toUTCString()} />
              <ResultRow label="Not after" value={calc.result.notAfter.toUTCString()} />
            </dl>
            {calc.result.subjectAltNames.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-fg-muted">Subject Alternative Names</p>
                <ul className="flex flex-col gap-1 font-mono text-sm">
                  {calc.result.subjectAltNames.map((san) => (
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
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

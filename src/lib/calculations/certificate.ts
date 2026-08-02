import {
  decodeAscii,
  decodeAsn1Time,
  decodeHex,
  decodeOid,
  getChildren,
  pemToDer,
  readTlv,
  type Asn1Node,
} from '../validation/asn1'
import type { CalculationResult } from './result'

const OID_NAMES: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
}

const SIGNATURE_ALGORITHM_NAMES: Record<string, string> = {
  '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
  '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
  '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
  '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
  '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
  '1.2.840.10045.4.3.3': 'ecdsa-with-SHA384',
}

const SUBJECT_ALT_NAME_OID = '2.5.29.17'

// SHA-1 and MD5-based signature algorithms are deprecated: SHA-1 collisions
// are practical (the 2017 SHAttered/2020 SHAmbles chosen-prefix attacks),
// and every major browser/CA stopped trusting SHA-1-signed certificates
// years ago. Matches by prefix against the resolved algorithm name (e.g.
// "sha1WithRSAEncryption"), not the raw OID, so it stays correct even if
// SIGNATURE_ALGORITHM_NAMES gains more entries later.
const WEAK_SIGNATURE_ALGORITHM_PATTERN = /^(md5|sha1)/i

export interface CertificateInfo {
  version: number
  serialNumber: string
  signatureAlgorithm: string
  isWeakSignatureAlgorithm: boolean
  issuer: Record<string, string>
  subject: Record<string, string>
  notBefore: Date
  notAfter: Date
  isExpired: boolean
  isNotYetValid: boolean
  subjectAltNames: string[]
}

function parseName(bytes: Uint8Array, nameNode: Asn1Node): Record<string, string> {
  const result: Record<string, string> = {}
  for (const rdn of getChildren(bytes, nameNode)) {
    for (const atv of getChildren(bytes, rdn)) {
      const [oidNode, valueNode] = getChildren(bytes, atv)
      if (!oidNode || !valueNode) continue
      const label = OID_NAMES[decodeOid(bytes, oidNode)]
      if (label) result[label] = decodeAscii(bytes, valueNode)
    }
  }
  return result
}

function extractSubjectAltNames(
  bytes: Uint8Array,
  tbsChildren: Asn1Node[],
  fromIndex: number,
): string[] {
  for (let i = fromIndex; i < tbsChildren.length; i++) {
    const node = tbsChildren[i]!
    if (node.tagClass !== 2 || node.tagNumber !== 3) continue // [3] extensions

    const [extensionsSeq] = getChildren(bytes, node)
    if (!extensionsSeq) continue

    for (const extension of getChildren(bytes, extensionsSeq)) {
      const extChildren = getChildren(bytes, extension)
      const oidNode = extChildren[0]
      if (!oidNode || decodeOid(bytes, oidNode) !== SUBJECT_ALT_NAME_OID) continue

      // Extension ::= SEQUENCE { extnID, critical BOOLEAN DEFAULT FALSE, extnValue OCTET STRING }
      // -- critical is optional, so extnValue is always the last child.
      const octetString = extChildren[extChildren.length - 1]!
      const inner = readTlv(bytes, octetString.contentStart)
      return getChildren(bytes, inner)
        .filter((generalName) => generalName.tagClass === 2 && generalName.tagNumber === 2) // [2] dNSName
        .map((generalName) => decodeAscii(bytes, generalName))
    }
  }
  return []
}

const PEM_CERT_BLOCK = /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g

/**
 * Splits a chain of concatenated PEM blocks (leaf, then intermediates, then
 * usually a root) into individual PEM strings, each parseable on its own by
 * parseCertificate. Order is preserved as given -- this doesn't attempt to
 * verify or reorder the chain, just separate what's already there.
 */
export function splitPemCertificates(pem: string): string[] {
  return pem.match(PEM_CERT_BLOCK) ?? []
}

export function parseCertificate(
  pem: string,
  now: Date = new Date(),
): CalculationResult<CertificateInfo> {
  const der = pemToDer(pem)
  if (!der) return { ok: false, error: 'Could not decode this as a PEM certificate.' }

  try {
    const certificate = readTlv(der, 0)
    const [tbsCertificate] = getChildren(der, certificate)
    if (!tbsCertificate)
      return { ok: false, error: 'Malformed certificate: missing TBSCertificate.' }

    const tbsChildren = getChildren(der, tbsCertificate)
    let index = 0

    let version = 1
    const first = tbsChildren[index]
    if (first && first.tagClass === 2 && first.tagNumber === 0) {
      const versionInt = getChildren(der, first)[0]
      if (versionInt) version = der[versionInt.contentStart]! + 1 // DER: v1=0, v2=1, v3=2
      index++
    }

    const serialNode = tbsChildren[index++]
    const signatureAlgNode = tbsChildren[index++]
    const issuerNode = tbsChildren[index++]
    const validityNode = tbsChildren[index++]
    const subjectNode = tbsChildren[index++]
    index++ // subjectPublicKeyInfo -- not surfaced by this tool

    if (!serialNode || !signatureAlgNode || !issuerNode || !validityNode || !subjectNode) {
      return { ok: false, error: 'Malformed certificate: missing required fields.' }
    }

    const serialNumber = decodeHex(der, serialNode)

    const sigOidNode = getChildren(der, signatureAlgNode)[0]
    const sigOid = sigOidNode ? decodeOid(der, sigOidNode) : ''
    const signatureAlgorithm = SIGNATURE_ALGORITHM_NAMES[sigOid] ?? sigOid
    const isWeakSignatureAlgorithm = WEAK_SIGNATURE_ALGORITHM_PATTERN.test(signatureAlgorithm)

    const issuer = parseName(der, issuerNode)
    const subject = parseName(der, subjectNode)

    const [notBeforeNode, notAfterNode] = getChildren(der, validityNode)
    if (!notBeforeNode || !notAfterNode) {
      return { ok: false, error: 'Malformed certificate: missing validity dates.' }
    }
    const notBefore = decodeAsn1Time(notBeforeNode.tagNumber, decodeAscii(der, notBeforeNode))
    const notAfter = decodeAsn1Time(notAfterNode.tagNumber, decodeAscii(der, notAfterNode))

    const subjectAltNames = extractSubjectAltNames(der, tbsChildren, index)

    return {
      ok: true,
      result: {
        version,
        serialNumber,
        signatureAlgorithm,
        isWeakSignatureAlgorithm,
        issuer,
        subject,
        notBefore,
        notAfter,
        isExpired: now > notAfter,
        isNotYetValid: now < notBefore,
        subjectAltNames,
      },
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Could not parse this certificate: ${error.message}`
          : 'Could not parse this certificate.',
    }
  }
}

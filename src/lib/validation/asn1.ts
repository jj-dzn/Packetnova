export interface Asn1Node {
  tagByte: number
  tagClass: number // 0 = universal, 1 = application, 2 = context-specific, 3 = private
  constructed: boolean
  tagNumber: number
  contentStart: number
  contentEnd: number
  nextOffset: number
}

export function readTlv(bytes: Uint8Array, offset: number): Asn1Node {
  const tagByte = bytes[offset]
  if (tagByte === undefined) throw new Error('Unexpected end of DER data while reading a tag.')

  const tagNumber = tagByte & 0x1f
  if (tagNumber === 0x1f) {
    throw new Error('Multi-byte tag numbers are not supported.')
  }

  const lengthByte = bytes[offset + 1]
  if (lengthByte === undefined)
    throw new Error('Unexpected end of DER data while reading a length.')

  let length: number
  let contentStart: number
  if (lengthByte < 0x80) {
    length = lengthByte
    contentStart = offset + 2
  } else {
    const numLengthBytes = lengthByte & 0x7f
    length = 0
    for (let i = 0; i < numLengthBytes; i++) {
      const b = bytes[offset + 2 + i]
      if (b === undefined)
        throw new Error('Unexpected end of DER data while reading a long-form length.')
      length = length * 256 + b
    }
    contentStart = offset + 2 + numLengthBytes
  }

  const contentEnd = contentStart + length

  return {
    tagByte,
    tagClass: (tagByte & 0xc0) >> 6,
    constructed: (tagByte & 0x20) !== 0,
    tagNumber,
    contentStart,
    contentEnd,
    nextOffset: contentEnd,
  }
}

export function getChildren(
  bytes: Uint8Array,
  node: Pick<Asn1Node, 'contentStart' | 'contentEnd'>,
): Asn1Node[] {
  const children: Asn1Node[] = []
  let offset = node.contentStart
  while (offset < node.contentEnd) {
    const child = readTlv(bytes, offset)
    children.push(child)
    offset = child.nextOffset
  }
  return children
}

export function decodeOid(
  bytes: Uint8Array,
  node: Pick<Asn1Node, 'contentStart' | 'contentEnd'>,
): string {
  const first = bytes[node.contentStart]
  if (first === undefined) return ''
  const parts = [Math.floor(first / 40), first % 40]
  let value = 0
  for (let i = node.contentStart + 1; i < node.contentEnd; i++) {
    const b = bytes[i]!
    value = value * 128 + (b & 0x7f)
    if ((b & 0x80) === 0) {
      parts.push(value)
      value = 0
    }
  }
  return parts.join('.')
}

export function decodeAscii(
  bytes: Uint8Array,
  node: Pick<Asn1Node, 'contentStart' | 'contentEnd'>,
): string {
  return Array.from(bytes.slice(node.contentStart, node.contentEnd))
    .map((b) => String.fromCharCode(b))
    .join('')
}

export function decodeHex(
  bytes: Uint8Array,
  node: Pick<Asn1Node, 'contentStart' | 'contentEnd'>,
): string {
  return Array.from(bytes.slice(node.contentStart, node.contentEnd))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(':')
}

// UTCTime (tag 23) is "YYMMDDHHMMSSZ"; per RFC 5280, YY < 50 means 20YY,
// otherwise 19YY. GeneralizedTime (tag 24) is "YYYYMMDDHHMMSSZ".
export function decodeAsn1Time(tagNumber: number, text: string): Date {
  if (tagNumber === 23) {
    const yy = parseInt(text.slice(0, 2), 10)
    const year = yy < 50 ? 2000 + yy : 1900 + yy
    return new Date(
      Date.UTC(
        year,
        parseInt(text.slice(2, 4), 10) - 1,
        parseInt(text.slice(4, 6), 10),
        parseInt(text.slice(6, 8), 10),
        parseInt(text.slice(8, 10), 10),
        parseInt(text.slice(10, 12), 10),
      ),
    )
  }
  return new Date(
    Date.UTC(
      parseInt(text.slice(0, 4), 10),
      parseInt(text.slice(4, 6), 10) - 1,
      parseInt(text.slice(6, 8), 10),
      parseInt(text.slice(8, 10), 10),
      parseInt(text.slice(10, 12), 10),
      parseInt(text.slice(12, 14), 10),
    ),
  )
}

export function pemToDer(pem: string): Uint8Array | null {
  const match = /-----BEGIN CERTIFICATE-----([\s\S]+?)-----END CERTIFICATE-----/.exec(pem)
  const base64 = (match?.[1] ?? pem).replace(/\s+/g, '')
  if (!base64) return null
  try {
    const binary = atob(base64)
    return Uint8Array.from(binary, (char) => char.charCodeAt(0))
  } catch {
    return null
  }
}

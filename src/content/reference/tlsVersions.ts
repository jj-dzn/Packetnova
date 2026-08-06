export interface TlsVersionEntry {
  version: string
  year: number
  status: string
  notes: string
  rfc: string
}

export const tlsVersions: TlsVersionEntry[] = [
  {
    version: 'SSL 3.0',
    year: 1996,
    status: 'Insecure -- do not use',
    notes: 'Broken by the POODLE attack; superseded entirely by TLS',
    rfc: 'RFC 6101 (informational)',
  },
  {
    version: 'TLS 1.0',
    year: 1999,
    status: 'Deprecated',
    notes: 'Weak cipher support (RC4, CBC padding issues); formally deprecated by RFC 8996 (2021)',
    rfc: 'RFC 2246',
  },
  {
    version: 'TLS 1.1',
    year: 2006,
    status: 'Deprecated',
    notes:
      'Incremental fix over 1.0; still lacks modern AEAD ciphers; deprecated alongside 1.0 by RFC 8996',
    rfc: 'RFC 4346',
  },
  {
    version: 'TLS 1.2',
    year: 2008,
    status: 'Still widely supported',
    notes: 'Added AEAD cipher suites (e.g. AES-GCM); the long-standing baseline for compatibility',
    rfc: 'RFC 5246',
  },
  {
    version: 'TLS 1.3',
    year: 2018,
    status: 'Current best practice',
    notes: 'Faster 1-RTT (or 0-RTT) handshake, removes weak/legacy ciphers entirely',
    rfc: 'RFC 8446',
  },
]

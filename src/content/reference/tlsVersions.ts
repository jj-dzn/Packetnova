export interface TlsVersionEntry {
  version: string
  year: number
  status: string
  notes: string
}

export const tlsVersions: TlsVersionEntry[] = [
  {
    version: 'SSL 3.0',
    year: 1996,
    status: 'Insecure -- do not use',
    notes: 'Broken by the POODLE attack; superseded entirely by TLS',
  },
  {
    version: 'TLS 1.0',
    year: 1999,
    status: 'Deprecated',
    notes: 'Weak cipher support (RC4, CBC padding issues); formally deprecated industry-wide',
  },
  {
    version: 'TLS 1.1',
    year: 2006,
    status: 'Deprecated',
    notes: 'Incremental fix over 1.0; still lacks modern AEAD ciphers',
  },
  {
    version: 'TLS 1.2',
    year: 2008,
    status: 'Still widely supported',
    notes: 'Added AEAD cipher suites (e.g. AES-GCM); the long-standing baseline for compatibility',
  },
  {
    version: 'TLS 1.3',
    year: 2018,
    status: 'Current best practice',
    notes: 'Faster 1-RTT (or 0-RTT) handshake, removes weak/legacy ciphers entirely',
  },
]

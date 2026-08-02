import type { HashAlgorithm } from '../../lib/calculations/hash'

const COREUTILS_CMD: Record<HashAlgorithm, string> = {
  MD5: 'md5sum',
  'SHA-1': 'sha1sum',
  'SHA-256': 'sha256sum',
  'SHA-384': 'sha384sum',
  'SHA-512': 'sha512sum',
}

const POWERSHELL_ALGO: Record<HashAlgorithm, string> = {
  MD5: 'MD5',
  'SHA-1': 'SHA1',
  'SHA-256': 'SHA256',
  'SHA-384': 'SHA384',
  'SHA-512': 'SHA512',
}

const OPENSSL_ALGO: Record<HashAlgorithm, string> = {
  MD5: 'md5',
  'SHA-1': 'sha1',
  'SHA-256': 'sha256',
  'SHA-384': 'sha384',
  'SHA-512': 'sha512',
}

/**
 * The same hash, computed the way an engineer actually would at a
 * terminal instead of in this browser tab -- one line per common
 * platform/toolchain, parameterized by whichever algorithm is currently
 * selected so the snippet always matches what's on screen.
 */
export function buildHashCliSnippet(algorithm: HashAlgorithm): string {
  return [
    '# Linux / macOS (coreutils)',
    `${COREUTILS_CMD[algorithm]} file.bin`,
    '',
    '# Windows PowerShell',
    `Get-FileHash file.bin -Algorithm ${POWERSHELL_ALGO[algorithm]}`,
    '',
    '# Any platform with OpenSSL',
    `openssl dgst -${OPENSSL_ALGO[algorithm]} file.bin`,
  ].join('\n')
}

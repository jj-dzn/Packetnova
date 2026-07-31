import { md5 } from 'js-md5'

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// MD5 isn't part of the Web Crypto API (it's cryptographically broken, so
// browsers never implemented it there) -- js-md5 covers that one case, and
// everything else goes through the browser's native, audited implementation.
export async function computeHash(data: ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === 'MD5') {
    return md5(data)
  }
  const digest = await crypto.subtle.digest(algorithm, data)
  return bufferToHex(digest)
}

export interface HashVerifyResult {
  computed: string
  matches: boolean
}

export async function verifyHash(
  data: ArrayBuffer,
  algorithm: HashAlgorithm,
  expectedHash: string,
): Promise<HashVerifyResult> {
  const computed = await computeHash(data, algorithm)
  return { computed, matches: computed.toLowerCase() === expectedHash.trim().toLowerCase() }
}

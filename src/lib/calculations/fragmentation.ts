import type { CalculationResult } from './result'

const IP_HEADER_BYTES = 20
// IPv4's Total Length header field is 16 bits, so a real packet can never
// exceed this -- also keeps the fragment loop below bounded.
const MAX_IPV4_PACKET_BYTES = 65_535

export interface Fragment {
  index: number
  payloadBytes: number
  totalBytes: number
  offsetBytes: number
  offsetUnits: number
  moreFragments: boolean
}

export interface FragmentationResult {
  packetSizeBytes: number
  pathMtu: number
  ipHeaderBytes: number
  needsFragmentation: boolean
  fragments: Fragment[]
}

/**
 * Per RFC 791: each fragment (other than the last) must carry a payload
 * that's a multiple of 8 bytes, since the 13-bit fragment offset field is
 * expressed in 8-byte units. Every fragment gets its own copy of the
 * 20-byte IP header.
 */
export function calculateFragmentation(
  packetSizeBytes: number,
  pathMtu: number,
): CalculationResult<FragmentationResult> {
  if (!Number.isFinite(packetSizeBytes) || packetSizeBytes <= IP_HEADER_BYTES) {
    return {
      ok: false,
      error: `Packet size must be greater than the IP header size (${IP_HEADER_BYTES} bytes).`,
    }
  }
  if (packetSizeBytes > MAX_IPV4_PACKET_BYTES) {
    return {
      ok: false,
      error: `Packet size can't exceed ${MAX_IPV4_PACKET_BYTES.toLocaleString()} bytes -- IPv4's Total Length header field is only 16 bits.`,
    }
  }
  if (!Number.isFinite(pathMtu) || pathMtu <= IP_HEADER_BYTES) {
    return {
      ok: false,
      error: `Path MTU must be greater than the IP header size (${IP_HEADER_BYTES} bytes).`,
    }
  }
  if (pathMtu > MAX_IPV4_PACKET_BYTES) {
    return {
      ok: false,
      error: `Path MTU can't exceed ${MAX_IPV4_PACKET_BYTES.toLocaleString()} bytes -- IPv4's Total Length header field is only 16 bits.`,
    }
  }

  const totalPayload = packetSizeBytes - IP_HEADER_BYTES

  if (packetSizeBytes <= pathMtu) {
    return {
      ok: true,
      result: {
        packetSizeBytes,
        pathMtu,
        ipHeaderBytes: IP_HEADER_BYTES,
        needsFragmentation: false,
        fragments: [
          {
            index: 1,
            payloadBytes: totalPayload,
            totalBytes: packetSizeBytes,
            offsetBytes: 0,
            offsetUnits: 0,
            moreFragments: false,
          },
        ],
      },
    }
  }

  const maxFragmentPayload = Math.floor((pathMtu - IP_HEADER_BYTES) / 8) * 8
  if (maxFragmentPayload <= 0) {
    return { ok: false, error: 'Path MTU is too small to carry any fragment payload.' }
  }

  const fragments: Fragment[] = []
  let remaining = totalPayload
  let offsetBytes = 0
  let index = 1

  while (remaining > 0) {
    const payloadBytes = Math.min(maxFragmentPayload, remaining)
    remaining -= payloadBytes
    fragments.push({
      index,
      payloadBytes,
      totalBytes: payloadBytes + IP_HEADER_BYTES,
      offsetBytes,
      offsetUnits: offsetBytes / 8,
      moreFragments: remaining > 0,
    })
    offsetBytes += payloadBytes
    index++
  }

  return {
    ok: true,
    result: {
      packetSizeBytes,
      pathMtu,
      ipHeaderBytes: IP_HEADER_BYTES,
      needsFragmentation: true,
      fragments,
    },
  }
}

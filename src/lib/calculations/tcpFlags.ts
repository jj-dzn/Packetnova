import type { CalculationResult } from './result'

export interface TcpFlags {
  urg: boolean
  ack: boolean
  psh: boolean
  rst: boolean
  syn: boolean
  fin: boolean
}

export interface TcpFlagsResult {
  flags: TcpFlags
  value: number
  hex: string
}

// Bit order (MSB to LSB) for these six classic control bits: URG ACK PSH
// RST SYN FIN. (CWR/ECE for ECN occupy the two bits above URG in the full
// modern flags byte but aren't part of this calculator.)
export function calculateTcpFlags(flags: TcpFlags): TcpFlagsResult {
  const value =
    (flags.urg ? 32 : 0) |
    (flags.ack ? 16 : 0) |
    (flags.psh ? 8 : 0) |
    (flags.rst ? 4 : 0) |
    (flags.syn ? 2 : 0) |
    (flags.fin ? 1 : 0)

  return { flags, value, hex: `0x${value.toString(16).padStart(2, '0')}` }
}

export interface TcpHeaderBuildFields {
  sourcePort: number
  destPort: number
  seqNumber: number
  ackNumber: number
  flags: TcpFlags
  windowSize: number
  checksum: number
  urgentPointer: number
}

export interface TcpHeaderBuildResult {
  bytes: number[]
  hex: string
}

function toBytes(value: number, byteCount: number): number[] {
  const bytes: number[] = []
  for (let i = byteCount - 1; i >= 0; i--) {
    bytes.push((value / 2 ** (i * 8)) & 0xff)
  }
  return bytes
}

/**
 * Builds the raw 20-byte TCP header (no options -- Data Offset is fixed at
 * 5) from every field, not just the flags byte -- an expert extension of
 * the flags-only calculator above, for seeing exactly where each value
 * lands in the byte stream.
 */
export function buildTcpHeader(
  fields: TcpHeaderBuildFields,
): CalculationResult<TcpHeaderBuildResult> {
  const checks: [boolean, string][] = [
    [
      Number.isInteger(fields.sourcePort) && fields.sourcePort >= 0 && fields.sourcePort <= 65535,
      'Source port must be a whole number between 0 and 65535.',
    ],
    [
      Number.isInteger(fields.destPort) && fields.destPort >= 0 && fields.destPort <= 65535,
      'Destination port must be a whole number between 0 and 65535.',
    ],
    [
      Number.isInteger(fields.seqNumber) && fields.seqNumber >= 0 && fields.seqNumber <= 4294967295,
      'Sequence number must be a whole number between 0 and 4294967295.',
    ],
    [
      Number.isInteger(fields.ackNumber) && fields.ackNumber >= 0 && fields.ackNumber <= 4294967295,
      'Acknowledgment number must be a whole number between 0 and 4294967295.',
    ],
    [
      Number.isInteger(fields.windowSize) && fields.windowSize >= 0 && fields.windowSize <= 65535,
      'Window size must be a whole number between 0 and 65535.',
    ],
    [
      Number.isInteger(fields.checksum) && fields.checksum >= 0 && fields.checksum <= 65535,
      'Checksum must be a whole number between 0 and 65535.',
    ],
    [
      Number.isInteger(fields.urgentPointer) &&
        fields.urgentPointer >= 0 &&
        fields.urgentPointer <= 65535,
      'Urgent pointer must be a whole number between 0 and 65535.',
    ],
  ]
  const failed = checks.find(([ok]) => !ok)
  if (failed) return { ok: false, error: failed[1] }

  const dataOffsetWords = 5 // no options modeled here
  const flagsByte = calculateTcpFlags(fields.flags).value

  const bytes = [
    ...toBytes(fields.sourcePort, 2),
    ...toBytes(fields.destPort, 2),
    ...toBytes(fields.seqNumber, 4),
    ...toBytes(fields.ackNumber, 4),
    (dataOffsetWords << 4) & 0xff,
    flagsByte,
    ...toBytes(fields.windowSize, 2),
    ...toBytes(fields.checksum, 2),
    ...toBytes(fields.urgentPointer, 2),
  ]

  return {
    ok: true,
    result: { bytes, hex: bytes.map((b) => b.toString(16).padStart(2, '0')).join('') },
  }
}

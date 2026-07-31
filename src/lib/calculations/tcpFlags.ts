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

export interface IpFlags {
  dontFragment: boolean
  moreFragments: boolean
}

export interface IpFlagsResult {
  flags: IpFlags
  value: number
  binary: string
}

// The 3-bit IPv4 flags field: bit 0 is reserved (always 0), bit 1 is DF,
// bit 2 is MF.
export function calculateIpFlags(flags: IpFlags): IpFlagsResult {
  const value = (flags.dontFragment ? 2 : 0) | (flags.moreFragments ? 1 : 0)
  return { flags, value, binary: value.toString(2).padStart(3, '0') }
}

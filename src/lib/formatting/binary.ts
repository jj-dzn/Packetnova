// Four 8-bit binary strings, most significant octet first -- e.g.
// 3232235777 -> ["11000000", "10101000", "00000001", "00000001"].
export function ipv4ToBinaryOctets(value: number): [string, string, string, string] {
  const normalized = value >>> 0
  return [24, 16, 8, 0].map((shift) =>
    ((normalized >>> shift) & 0xff).toString(2).padStart(8, '0'),
  ) as [string, string, string, string]
}

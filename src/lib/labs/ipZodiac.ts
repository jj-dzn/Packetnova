import { parseIPv4, type ParsedIPv4 } from '../validation/ip'

export interface ZodiacSign {
  name: string
  trait: string
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Loopback', trait: 'Always comes back to itself. Deeply introspective.' },
  { name: 'Broadcast', trait: 'Talks to everyone at once, whether they asked or not.' },
  { name: 'Multicast', trait: 'Picky about exactly who gets into the group chat.' },
  { name: 'Gateway', trait: 'The one everyone has to go through to get anywhere.' },
  { name: 'Firewall', trait: 'Guarded. Lets very little through without a good reason.' },
  { name: 'Subnet', trait: 'Keeps to itself, but part of something bigger.' },
  { name: 'Uplink', trait: 'Always reaching for something above its current station.' },
  { name: 'Failover', trait: 'Calm in a crisis. Has a backup plan for the backup plan.' },
  { name: 'Checksum', trait: 'Notices when something is even slightly off.' },
  { name: 'Handshake', trait: 'Makes a great first impression -- three times over.' },
  { name: 'Localhost', trait: 'Comfortable being alone. 127 kinds of self-sufficient.' },
  { name: 'Anycast', trait: 'Shows up wherever is most convenient at the time.' },
]

export const HOROSCOPES: string[] = [
  'A stray packet returns today carrying unexpectedly good news.',
  'Beware unexpected timeouts in situations you thought were resolved.',
  'A connection you assumed was dead quietly reconnects.',
  'Someone is about to route around you. Let them.',
  'Your patience is about to be measured in milliseconds.',
  'A small misconfiguration works out better than the plan ever did.',
  'Something you sent a while ago is finally about to arrive.',
  'Today favors those who retry instead of giving up after one attempt.',
  'An old connection resurfaces at the worst possible, funniest time.',
  'You will be asked to repeat yourself. Do it a little louder.',
]

/**
 * Deterministic so the same IP always yields the same sign/horoscope --
 * the fun is in sharing a specific IP, not in random reshuffling.
 */
export function zodiacForIp(parsed: ParsedIPv4): { sign: ZodiacSign; horoscope: string } {
  const [a, b, c, d] = parsed.octets
  const signIndex = (a + b + c + d) % ZODIAC_SIGNS.length
  const horoscopeIndex = parsed.value % HOROSCOPES.length
  return { sign: ZODIAC_SIGNS[signIndex]!, horoscope: HOROSCOPES[horoscopeIndex]! }
}

export function randomIpString(): string {
  const octet = () => Math.floor(Math.random() * 256)
  return `${octet()}.${octet()}.${octet()}.${octet()}`
}

export function zodiacForIpString(input: string) {
  const parsed = parseIPv4(input)
  if (!parsed) return null
  return zodiacForIp(parsed)
}

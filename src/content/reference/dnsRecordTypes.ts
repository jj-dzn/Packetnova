export interface DnsRecordEntry {
  type: string
  description: string
}

export const dnsRecordTypes: DnsRecordEntry[] = [
  { type: 'A', description: 'Maps a hostname to an IPv4 address' },
  { type: 'AAAA', description: 'Maps a hostname to an IPv6 address' },
  { type: 'CNAME', description: 'Aliases one hostname to another (canonical name)' },
  {
    type: 'MX',
    description: 'Specifies the mail server(s) responsible for a domain, with priority',
  },
  {
    type: 'TXT',
    description: 'Arbitrary text -- commonly used for SPF, DKIM, and domain verification',
  },
  {
    type: 'NS',
    description: 'Delegates a domain (or subdomain) to a set of authoritative name servers',
  },
  {
    type: 'SOA',
    description:
      "Start of Authority -- the zone's primary name server, admin contact, and refresh timers",
  },
  { type: 'PTR', description: 'Maps an IP address back to a hostname (reverse DNS)' },
  {
    type: 'SRV',
    description: 'Locates servers for a specific service (host, port, priority, weight)',
  },
  {
    type: 'CAA',
    description:
      'Specifies which Certificate Authorities are allowed to issue certs for the domain',
  },
]

export interface DnsRecordEntry {
  type: string
  description: string
  example: string
  rfc: string
}

export const dnsRecordTypes: DnsRecordEntry[] = [
  {
    type: 'A',
    description: 'Maps a hostname to an IPv4 address',
    example: 'example.com.  300  IN  A  93.184.216.34',
    rfc: 'RFC 1035',
  },
  {
    type: 'AAAA',
    description: 'Maps a hostname to an IPv6 address',
    example: 'example.com.  300  IN  AAAA  2606:2800:220:1:248:1893:25c8:1946',
    rfc: 'RFC 3596',
  },
  {
    type: 'CNAME',
    description: 'Aliases one hostname to another (canonical name)',
    example: 'www.example.com.  300  IN  CNAME  example.com.',
    rfc: 'RFC 1035',
  },
  {
    type: 'MX',
    description: 'Specifies the mail server(s) responsible for a domain, with priority',
    example: 'example.com.  300  IN  MX  10  mail.example.com.',
    rfc: 'RFC 1035',
  },
  {
    type: 'TXT',
    description: 'Arbitrary text -- commonly used for SPF, DKIM, and domain verification',
    example: 'example.com.  300  IN  TXT  "v=spf1 include:_spf.example.com ~all"',
    rfc: 'RFC 1035',
  },
  {
    type: 'NS',
    description: 'Delegates a domain (or subdomain) to a set of authoritative name servers',
    example: 'example.com.  300  IN  NS  ns1.example.com.',
    rfc: 'RFC 1035',
  },
  {
    type: 'SOA',
    description:
      "Start of Authority -- the zone's primary name server, admin contact, and refresh timers",
    example:
      'example.com.  300  IN  SOA  ns1.example.com. admin.example.com. 2024010101 7200 3600 1209600 300',
    rfc: 'RFC 1035',
  },
  {
    type: 'PTR',
    description: 'Maps an IP address back to a hostname (reverse DNS)',
    example: '34.216.184.93.in-addr.arpa.  300  IN  PTR  example.com.',
    rfc: 'RFC 1035',
  },
  {
    type: 'SRV',
    description: 'Locates servers for a specific service (host, port, priority, weight)',
    example: '_sip._tcp.example.com.  300  IN  SRV  10 60 5060  sipserver.example.com.',
    rfc: 'RFC 2782',
  },
  {
    type: 'CAA',
    description:
      'Specifies which Certificate Authorities are allowed to issue certs for the domain',
    example: 'example.com.  300  IN  CAA  0 issue "letsencrypt.org"',
    rfc: 'RFC 8659',
  },
]

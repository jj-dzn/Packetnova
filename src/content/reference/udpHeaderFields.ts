import type { HeaderField } from './tcpHeaderFields'

// Per RFC 768 -- UDP's entire header is just these four fields.
export const udpHeaderFields: HeaderField[] = [
  {
    field: 'Source Port',
    offset: '0',
    size: '16 bits',
    description: 'Port number of the sender (0 if unused)',
  },
  {
    field: 'Destination Port',
    offset: '2',
    size: '16 bits',
    description: 'Port number of the receiver',
  },
  {
    field: 'Length',
    offset: '4',
    size: '16 bits',
    description: 'Length of the UDP header plus data, in bytes',
  },
  {
    field: 'Checksum',
    offset: '6',
    size: '16 bits',
    description: 'Error-checking checksum (optional in IPv4, mandatory in IPv6)',
  },
]

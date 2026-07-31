import type { HeaderField } from './tcpHeaderFields'

// Per RFC 791 -- IPv4 header.
export const ipHeaderFields: HeaderField[] = [
  { field: 'Version', offset: '0', size: '4 bits', description: 'IP version -- 4 for IPv4' },
  {
    field: 'IHL',
    offset: '0.5',
    size: '4 bits',
    description: 'Header length, in 32-bit words (minimum 5 = 20 bytes)',
  },
  {
    field: 'Type of Service (DSCP + ECN)',
    offset: '1',
    size: '8 bits',
    description: 'Quality-of-service marking',
  },
  {
    field: 'Total Length',
    offset: '2',
    size: '16 bits',
    description: 'Entire packet size, header plus data, in bytes',
  },
  {
    field: 'Identification',
    offset: '4',
    size: '16 bits',
    description: 'Identifies fragments belonging to the same original packet',
  },
  {
    field: 'Flags',
    offset: '6',
    size: '3 bits',
    description: 'Reserved, Don’t Fragment (DF), More Fragments (MF)',
  },
  {
    field: 'Fragment Offset',
    offset: '6.375',
    size: '13 bits',
    description: 'Position of this fragment in the original packet, in 8-byte units',
  },
  {
    field: 'Time to Live',
    offset: '8',
    size: '8 bits',
    description: 'Hop limit, decremented by each router',
  },
  {
    field: 'Protocol',
    offset: '9',
    size: '8 bits',
    description: 'Next-layer protocol -- 1 = ICMP, 6 = TCP, 17 = UDP',
  },
  {
    field: 'Header Checksum',
    offset: '10',
    size: '16 bits',
    description: 'Error-checking for the header only',
  },
  { field: 'Source Address', offset: '12', size: '32 bits', description: 'Sender IPv4 address' },
  {
    field: 'Destination Address',
    offset: '16',
    size: '32 bits',
    description: 'Receiver IPv4 address',
  },
  { field: 'Options', offset: '20', size: 'Variable', description: 'Present only if IHL > 5' },
]

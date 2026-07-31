export interface HeaderField {
  field: string
  offset: string
  size: string
  description: string
}

// Per RFC 9293 (formerly RFC 793).
export const tcpHeaderFields: HeaderField[] = [
  { field: 'Source Port', offset: '0', size: '16 bits', description: 'Port number of the sender' },
  {
    field: 'Destination Port',
    offset: '2',
    size: '16 bits',
    description: 'Port number of the receiver',
  },
  {
    field: 'Sequence Number',
    offset: '4',
    size: '32 bits',
    description: 'Sequence number of the first data byte in this segment',
  },
  {
    field: 'Acknowledgment Number',
    offset: '8',
    size: '32 bits',
    description: 'Next sequence number the sender expects (valid if ACK is set)',
  },
  {
    field: 'Data Offset',
    offset: '12',
    size: '4 bits',
    description: 'Header length, in 32-bit words (minimum 5 = 20 bytes)',
  },
  { field: 'Reserved', offset: '12.5', size: '3 bits', description: 'Reserved, must be zero' },
  {
    field: 'Flags',
    offset: '13',
    size: '9 bits',
    description: 'Control bits: NS, CWR, ECE, URG, ACK, PSH, RST, SYN, FIN',
  },
  {
    field: 'Window Size',
    offset: '14',
    size: '16 bits',
    description: 'Flow-control receive window size',
  },
  { field: 'Checksum', offset: '16', size: '16 bits', description: 'Error-checking checksum' },
  {
    field: 'Urgent Pointer',
    offset: '18',
    size: '16 bits',
    description: 'Offset to urgent data (valid if URG is set)',
  },
  {
    field: 'Options',
    offset: '20',
    size: 'Variable',
    description: 'Present only if Data Offset > 5',
  },
]

export interface DhcpOptionEntry {
  option: number
  name: string
  description: string
}

// Per RFC 2132.
export const dhcpOptions: DhcpOptionEntry[] = [
  { option: 1, name: 'Subnet Mask', description: "Client's subnet mask" },
  { option: 3, name: 'Router', description: 'Default gateway address(es)' },
  { option: 6, name: 'Domain Name Server', description: 'DNS server address(es)' },
  { option: 12, name: 'Host Name', description: "Client's host name" },
  { option: 15, name: 'Domain Name', description: "Client's DNS domain suffix" },
  {
    option: 51,
    name: 'IP Address Lease Time',
    description: 'How long the lease is valid, in seconds',
  },
  {
    option: 53,
    name: 'DHCP Message Type',
    description: 'DISCOVER, OFFER, REQUEST, ACK, NAK, etc.',
  },
  {
    option: 54,
    name: 'Server Identifier',
    description: 'IP address of the DHCP server sending this message',
  },
  {
    option: 55,
    name: 'Parameter Request List',
    description: 'Options the client is asking the server to include in its reply',
  },
  {
    option: 58,
    name: 'Renewal Time (T1)',
    description: 'When the client should start trying to renew the lease',
  },
  {
    option: 59,
    name: 'Rebinding Time (T2)',
    description: 'When the client should broadcast to rebind if renewal failed',
  },
]

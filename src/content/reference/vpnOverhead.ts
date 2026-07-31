export interface TunnelOverheadPreset {
  id: string
  label: string
  overheadBytes: number
  note?: string
}

// Byte figures for WireGuard/OpenVPN/IPsec are commonly-cited typical values,
// not fixed constants -- actual overhead varies by cipher, auth algorithm,
// and mode. GRE's 24 bytes (4-byte GRE header + 20-byte outer IPv4 header)
// is structurally fixed and not an approximation.
export const tunnelOverheadPresets: TunnelOverheadPreset[] = [
  {
    id: 'wireguard',
    label: 'WireGuard (IPv4)',
    overheadBytes: 60,
    note: 'Typical value -- fixed protocol overhead, minor variance by config',
  },
  {
    id: 'openvpn',
    label: 'OpenVPN (UDP, AES-256-GCM)',
    overheadBytes: 57,
    note: 'Approximate -- varies by cipher and HMAC choice',
  },
  {
    id: 'ipsec-esp',
    label: 'IPsec (ESP, tunnel mode)',
    overheadBytes: 73,
    note: 'Approximate -- varies by cipher, auth algorithm, and mode',
  },
  {
    id: 'gre',
    label: 'GRE',
    overheadBytes: 24,
  },
  {
    id: 'custom',
    label: 'Custom',
    overheadBytes: 0,
  },
]

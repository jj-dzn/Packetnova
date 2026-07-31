// A small, individually-verified set of well-known OUIs -- NOT the full
// IEEE registry (that's ~50,000+ entries). Each of these was confirmed
// against IEEE registration records before being added here; unverified
// values were deliberately left out rather than guessed.
export const knownOuis: Record<string, string> = {
  '00:00:0c': 'Cisco Systems, Inc.',
  '00:50:56': 'VMware, Inc.',
  '00:0c:29': 'VMware, Inc.',
  'b8:27:eb': 'Raspberry Pi Foundation',
  'dc:a6:32': 'Raspberry Pi Trading Ltd',
}

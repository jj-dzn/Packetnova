import { parseIPv4, prefixLengthToSubnetMask, invertMask, ipv4ToString } from '../validation/ip'

export type ConfigVendor = 'ios' | 'nxos' | 'junos' | 'eos' | 'mikrotik' | 'pfsense'

export const CONFIG_VENDORS: ConfigVendor[] = ['ios', 'nxos', 'junos', 'eos', 'mikrotik', 'pfsense']

export const CONFIG_VENDOR_LABELS: Record<ConfigVendor, string> = {
  ios: 'Cisco IOS',
  nxos: 'Cisco NX-OS',
  junos: 'Juniper Junos',
  eos: 'Arista EOS',
  mikrotik: 'MikroTik RouterOS',
  pfsense: 'pfSense',
}

// pfSense is GUI/XML-configured, not line-CLI-driven like the other five --
// its builder emits real FreeBSD ifconfig/route syntax plus the exact GUI
// path, rather than inventing a pfSense-native config language that
// doesn't exist. .txt reflects that it's reference notes, not a file
// pfSense itself would ever load.
export const CONFIG_VENDOR_FILE_EXTENSION: Record<ConfigVendor, string> = {
  ios: 'cfg',
  nxos: 'cfg',
  junos: 'conf',
  eos: 'cfg',
  mikrotik: 'rsc',
  pfsense: 'txt',
}

export const DEFAULT_INTERFACE_NAME: Record<ConfigVendor, string> = {
  ios: 'GigabitEthernet0/1',
  nxos: 'Ethernet1/1',
  junos: 'ge-0/0/1',
  eos: 'Ethernet1',
  mikrotik: 'ether1',
  pfsense: 'em0',
}

export interface InterfaceConfigInput {
  vendor: ConfigVendor
  hostname: string
  interfaceName: string
  ipAddress: string
  prefixLength: number
  vlanId?: number
  mtu?: number
  description?: string
}

export interface StaticRouteConfigInput {
  vendor: ConfigVendor
  hostname: string
  destinationNetwork: string
  destinationPrefixLength: number
  nextHop: string
  description?: string
}

export type ConfigResult = { ok: true; result: { config: string } } | { ok: false; error: string }

function validateHost(label: string, address: string, prefixLength: number) {
  const ip = parseIPv4(address)
  if (!ip) return `Enter a valid ${label} IPv4 address, e.g. 10.0.12.1.`
  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    return `${label} prefix length must be a whole number between 0 and 32.`
  }
  return null
}

function buildIosLikeInterfaceConfig(
  input: InterfaceConfigInput,
  mask: string,
  commentChar: string,
  indent: string,
): string {
  const { vendor, hostname, interfaceName, vlanId, mtu, description } = input
  const usesCidr = vendor === 'nxos' || vendor === 'eos'
  const addressLine = usesCidr
    ? `${indent}ip address ${input.ipAddress}/${input.prefixLength}`
    : `${indent}ip address ${input.ipAddress} ${mask}`
  const targetInterface = vlanId ? `${interfaceName}.${vlanId}` : interfaceName
  const encapsulationLine = vlanId
    ? vendor === 'eos'
      ? `${indent}encapsulation dot1q vlan ${vlanId}`
      : `${indent}encapsulation dot1Q ${vlanId}`
    : null

  const lines: string[] = [`hostname ${hostname}`, commentChar]
  lines.push(`interface ${targetInterface}`)
  if (description) lines.push(`${indent}description ${description}`)
  if ((vendor === 'eos' || vendor === 'nxos') && !vlanId) lines.push(`${indent}no switchport`)
  if (encapsulationLine) lines.push(encapsulationLine)
  lines.push(addressLine)
  if (mtu) lines.push(`${indent}mtu ${mtu}`)
  lines.push(`${indent}no shutdown`)
  lines.push(commentChar)
  return lines.join('\n')
}

function buildJunosInterfaceConfig(input: InterfaceConfigInput): string {
  const { hostname, interfaceName, vlanId, mtu, description } = input
  const unit = vlanId ?? 0
  const prefix = `set interfaces ${interfaceName} unit ${unit}`
  const lines: string[] = [`set system host-name ${hostname}`]
  if (description) lines.push(`${prefix} description "${description}"`)
  if (vlanId) lines.push(`${prefix} vlan-id ${vlanId}`)
  lines.push(`${prefix} family inet address ${input.ipAddress}/${input.prefixLength}`)
  if (mtu) lines.push(`set interfaces ${interfaceName} mtu ${mtu}`)
  return lines.join('\n')
}

function buildMikrotikInterfaceConfig(input: InterfaceConfigInput): string {
  const { hostname, interfaceName, vlanId, mtu, description, ipAddress, prefixLength } = input
  const lines: string[] = [`/system identity set name=${hostname}`]
  let addressInterface = interfaceName
  if (vlanId) {
    addressInterface = `vlan${vlanId}`
    lines.push(
      `/interface vlan add name=${addressInterface} vlan-id=${vlanId} interface=${interfaceName}`,
    )
  }
  if (mtu) lines.push(`/interface ethernet set [find default-name=${interfaceName}] mtu=${mtu}`)
  const commentPart = description ? ` comment="${description}"` : ''
  lines.push(
    `/ip address add address=${ipAddress}/${prefixLength} interface=${addressInterface}${commentPart}`,
  )
  return lines.join('\n')
}

function buildPfsenseInterfaceConfig(input: InterfaceConfigInput, mask: string): string {
  const { hostname, interfaceName, vlanId, mtu, description, ipAddress } = input
  const lines: string[] = [
    `# pfSense host: ${hostname} -- configured via the web GUI, not a line CLI.`,
    `# Interfaces > [Assign] to bind ${interfaceName}, then set its static IPv4 address:`,
  ]
  let physicalInterface = interfaceName
  if (vlanId) {
    lines.push(
      `# Interfaces > Assignments > VLANs: parent ${interfaceName}, tag ${vlanId} -- creates ${interfaceName}.${vlanId}${description ? ` ("${description}")` : ''}, then assign that as a new interface.`,
    )
    physicalInterface = `${interfaceName}.${vlanId}`
  } else if (description) {
    lines.push(`# Interfaces > ${interfaceName}: set the description to "${description}".`)
  }
  lines.push('#')
  lines.push('# Equivalent from a shell (Diagnostics > Command Prompt), for reference:')
  lines.push(
    `ifconfig ${physicalInterface} inet ${ipAddress} netmask ${mask}${mtu ? ` mtu ${mtu}` : ''}`,
  )
  return lines.join('\n')
}

const INTERFACE_BUILDERS: Record<
  ConfigVendor,
  (input: InterfaceConfigInput, mask: string) => string
> = {
  ios: (input, mask) => buildIosLikeInterfaceConfig(input, mask, '!', ' '),
  nxos: (input, mask) => buildIosLikeInterfaceConfig(input, mask, '!', '  '),
  eos: (input, mask) => buildIosLikeInterfaceConfig(input, mask, '!', '   '),
  junos: (input) => buildJunosInterfaceConfig(input),
  mikrotik: (input) => buildMikrotikInterfaceConfig(input),
  pfsense: buildPfsenseInterfaceConfig,
}

export function buildInterfaceConfig(input: InterfaceConfigInput): ConfigResult {
  const error = validateHost('interface', input.ipAddress, input.prefixLength)
  if (error) return { ok: false, error }
  if (!input.interfaceName.trim()) return { ok: false, error: 'Enter an interface name.' }
  if (!input.hostname.trim()) return { ok: false, error: 'Enter a hostname.' }
  if (input.vlanId !== undefined && (input.vlanId < 1 || input.vlanId > 4094)) {
    return { ok: false, error: 'VLAN ID must be between 1 and 4094.' }
  }

  const mask = ipv4ToString(prefixLengthToSubnetMask(input.prefixLength).value)
  const config = INTERFACE_BUILDERS[input.vendor](input, mask)
  return { ok: true, result: { config } }
}

function buildRouteLine(vendor: ConfigVendor, input: StaticRouteConfigInput, mask: string): string {
  const { destinationNetwork, destinationPrefixLength, nextHop, description } = input
  switch (vendor) {
    case 'ios':
      return `ip route ${destinationNetwork} ${mask} ${nextHop}`
    case 'nxos':
    case 'eos':
      return `ip route ${destinationNetwork}/${destinationPrefixLength} ${nextHop}`
    case 'junos':
      return `set routing-options static route ${destinationNetwork}/${destinationPrefixLength} next-hop ${nextHop}${description ? ` /* ${description} */` : ''}`
    case 'mikrotik':
      return `/ip route add dst-address=${destinationNetwork}/${destinationPrefixLength} gateway=${nextHop}${description ? ` comment="${description}"` : ''}`
    case 'pfsense':
      return `route add -net ${destinationNetwork}/${destinationPrefixLength} ${nextHop}`
  }
}

export function buildStaticRouteConfig(input: StaticRouteConfigInput): ConfigResult {
  const destError = validateHost(
    'destination',
    input.destinationNetwork,
    input.destinationPrefixLength,
  )
  if (destError) return { ok: false, error: destError }
  if (!parseIPv4(input.nextHop)) return { ok: false, error: 'Enter a valid next-hop IPv4 address.' }
  if (!input.hostname.trim()) return { ok: false, error: 'Enter a hostname.' }

  const mask = ipv4ToString(prefixLengthToSubnetMask(input.destinationPrefixLength).value)
  const routeLine = buildRouteLine(input.vendor, input, mask)

  if (input.vendor === 'pfsense') {
    return {
      ok: true,
      result: {
        config: [
          `# pfSense host: ${input.hostname} -- System > Routing > Static Routes:`,
          `# destination ${input.destinationNetwork}/${input.destinationPrefixLength}, gateway ${input.nextHop}${input.description ? `, description "${input.description}"` : ''}`,
          '#',
          '# Equivalent from a shell (Diagnostics > Command Prompt), for reference:',
          routeLine,
        ].join('\n'),
      },
    }
  }

  const lines =
    input.vendor === 'junos'
      ? [`set system host-name ${input.hostname}`, routeLine]
      : [`hostname ${input.hostname}`, '!', routeLine]
  return { ok: true, result: { config: lines.join('\n') } }
}

export interface AclConfigInput {
  vendor: ConfigVendor
  hostname: string
  aclName: string
  action: 'permit' | 'deny'
  sourceNetwork: string
  sourcePrefixLength: number
}

function buildAclLines(vendor: ConfigVendor, input: AclConfigInput, wildcard: string): string[] {
  const { aclName, action, sourceNetwork, sourcePrefixLength } = input
  const cidr = `${sourceNetwork}/${sourcePrefixLength}`
  switch (vendor) {
    case 'ios':
      return [
        `ip access-list extended ${aclName}`,
        ` ${action} ip ${sourceNetwork} ${wildcard} any`,
      ]
    case 'nxos':
      return [`ip access-list ${aclName}`, `  10 ${action} ip ${cidr} any`]
    case 'eos':
      return [`ip access-list ${aclName}`, `   10 ${action} ip ${cidr} any`]
    case 'junos':
      return [
        `set firewall filter ${aclName} term allow-source from source-address ${cidr}`,
        `set firewall filter ${aclName} term allow-source then ${action === 'permit' ? 'accept' : 'discard'}`,
      ]
    case 'mikrotik':
      return [
        `/ip firewall filter add chain=forward action=${action === 'permit' ? 'accept' : 'drop'} src-address=${cidr} comment="${aclName}"`,
      ]
    case 'pfsense':
      return [
        `# pfSense host: ${input.hostname} -- Firewall > Rules:`,
        `# Action: ${action === 'permit' ? 'Pass' : 'Block'}, Source: ${cidr}, Description: "${aclName}"`,
        '#',
        '# Equivalent pf syntax (reference only -- pfSense manages pf.conf itself):',
        `${action === 'permit' ? 'pass' : 'block'} in from ${cidr} to any`,
      ]
  }
}

export function buildAclConfig(input: AclConfigInput): ConfigResult {
  const error = validateHost('source', input.sourceNetwork, input.sourcePrefixLength)
  if (error) return { ok: false, error }
  if (!input.aclName.trim()) return { ok: false, error: 'Enter an ACL name.' }
  if (!input.hostname.trim()) return { ok: false, error: 'Enter a hostname.' }

  const mask = prefixLengthToSubnetMask(input.sourcePrefixLength)
  const wildcard = ipv4ToString(invertMask(mask).value)
  const aclLines = buildAclLines(input.vendor, input, wildcard)

  if (input.vendor === 'pfsense') {
    return { ok: true, result: { config: aclLines.join('\n') } }
  }

  const lines =
    input.vendor === 'junos'
      ? [`set system host-name ${input.hostname}`, ...aclLines]
      : [`hostname ${input.hostname}`, '!', ...aclLines]
  return { ok: true, result: { config: lines.join('\n') } }
}

export interface VlanDatabaseEntry {
  id: number
  name: string
}

export interface VlanDatabaseConfigInput {
  vendor: ConfigVendor
  hostname: string
  vlans: VlanDatabaseEntry[]
}

function buildVlanDatabaseLines(vendor: ConfigVendor, vlans: VlanDatabaseEntry[]): string[] {
  switch (vendor) {
    case 'ios':
      return vlans.flatMap((v) => [`vlan ${v.id}`, ` name ${v.name}`, '!'])
    case 'nxos':
      return vlans.flatMap((v) => [`vlan ${v.id}`, `  name ${v.name}`, '!'])
    case 'eos':
      return vlans.flatMap((v) => [`vlan ${v.id}`, `   name ${v.name}`, '!'])
    case 'junos':
      return vlans.map((v) => `set vlans ${v.name} vlan-id ${v.id}`)
    case 'mikrotik':
      return vlans.map(
        (v) =>
          `/interface vlan add name=${v.name} vlan-id=${v.id} interface=${DEFAULT_INTERFACE_NAME.mikrotik}`,
      )
    case 'pfsense':
      return [
        '# pfSense: Interfaces > Assignments > VLANs, for each:',
        ...vlans.map(
          (v) =>
            `#   parent ${DEFAULT_INTERFACE_NAME.pfsense}, tag ${v.id}, description "${v.name}"`,
        ),
      ]
  }
}

export function buildVlanDatabaseConfig(input: VlanDatabaseConfigInput): ConfigResult {
  if (!input.hostname.trim()) return { ok: false, error: 'Enter a hostname.' }
  if (input.vlans.length === 0) {
    return { ok: false, error: 'Enter at least one VLAN as id:name, e.g. 10:Voice, 20:Data.' }
  }
  for (const vlan of input.vlans) {
    if (!Number.isInteger(vlan.id) || vlan.id < 1 || vlan.id > 4094) {
      return { ok: false, error: `VLAN ID ${vlan.id} must be between 1 and 4094.` }
    }
    if (!vlan.name.trim()) {
      return { ok: false, error: `VLAN ${vlan.id} needs a name.` }
    }
  }

  const vlanLines = buildVlanDatabaseLines(input.vendor, input.vlans)

  if (input.vendor === 'pfsense') {
    return { ok: true, result: { config: vlanLines.join('\n') } }
  }

  const lines =
    input.vendor === 'junos'
      ? [`set system host-name ${input.hostname}`, ...vlanLines]
      : [`hostname ${input.hostname}`, '!', ...vlanLines]
  return { ok: true, result: { config: lines.join('\n') } }
}

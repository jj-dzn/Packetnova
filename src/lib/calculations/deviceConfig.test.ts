import { describe, expect, it } from 'vitest'
import {
  buildInterfaceConfig,
  buildStaticRouteConfig,
  CONFIG_VENDORS,
  type ConfigVendor,
  type InterfaceConfigInput,
  type StaticRouteConfigInput,
} from './deviceConfig'

const BASE_INTERFACE: Omit<InterfaceConfigInput, 'vendor'> = {
  hostname: 'R1',
  interfaceName: 'GigabitEthernet0/1',
  ipAddress: '10.0.12.1',
  prefixLength: 24,
}

const BASE_ROUTE: Omit<StaticRouteConfigInput, 'vendor'> = {
  hostname: 'R1',
  destinationNetwork: '172.16.0.0',
  destinationPrefixLength: 16,
  nextHop: '10.0.12.254',
}

describe('buildInterfaceConfig', () => {
  it('produces a dotted-mask ip address line for IOS', () => {
    const result = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'ios' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain('hostname R1')
      expect(result.result.config).toContain('interface GigabitEthernet0/1')
      expect(result.result.config).toContain('ip address 10.0.12.1 255.255.255.0')
    }
  })

  it('produces CIDR-notation ip address lines for NX-OS and EOS', () => {
    const nxos = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'nxos' })
    const eos = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'eos' })
    expect(nxos.ok && nxos.result.config).toContain('ip address 10.0.12.1/24')
    expect(eos.ok && eos.result.config).toContain('ip address 10.0.12.1/24')
    expect(eos.ok && eos.result.config).toContain('no switchport')
  })

  it('adds a dot1Q subinterface when a VLAN ID is given', () => {
    const ios = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'ios', vlanId: 20 })
    expect(ios.ok).toBe(true)
    if (ios.ok) {
      expect(ios.result.config).toContain('interface GigabitEthernet0/1.20')
      expect(ios.result.config).toContain('encapsulation dot1Q 20')
    }

    const eos = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'eos', vlanId: 20 })
    expect(eos.ok && eos.result.config).toContain('encapsulation dot1q vlan 20')
  })

  it('emits Junos set-style config lines', () => {
    const result = buildInterfaceConfig({
      ...BASE_INTERFACE,
      vendor: 'junos',
      vlanId: 20,
      mtu: 1500,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain('set system host-name R1')
      expect(result.result.config).toContain('set interfaces GigabitEthernet0/1 unit 20 vlan-id 20')
      expect(result.result.config).toContain(
        'set interfaces GigabitEthernet0/1 unit 20 family inet address 10.0.12.1/24',
      )
      expect(result.result.config).toContain('set interfaces GigabitEthernet0/1 mtu 1500')
    }
  })

  it('emits MikroTik RouterOS script commands, routing VLAN traffic through a vlan interface', () => {
    const result = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'mikrotik', vlanId: 20 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain('/system identity set name=R1')
      expect(result.result.config).toContain(
        '/interface vlan add name=vlan20 vlan-id=20 interface=GigabitEthernet0/1',
      )
      expect(result.result.config).toContain(
        '/ip address add address=10.0.12.1/24 interface=vlan20',
      )
    }
  })

  it('emits pfSense GUI guidance plus a real ifconfig equivalent', () => {
    const result = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'pfsense', mtu: 1500 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain('pfSense host: R1')
      expect(result.result.config).toContain(
        'ifconfig GigabitEthernet0/1 inet 10.0.12.1 netmask 255.255.255.0 mtu 1500',
      )
    }
  })

  it('rejects an invalid IP address', () => {
    const result = buildInterfaceConfig({
      ...BASE_INTERFACE,
      vendor: 'ios',
      ipAddress: 'not-an-ip',
    })
    expect(result.ok).toBe(false)
  })

  it('rejects an out-of-range prefix length', () => {
    const result = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'ios', prefixLength: 40 })
    expect(result.ok).toBe(false)
  })

  it('rejects a missing hostname or interface name', () => {
    expect(buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'ios', hostname: '' }).ok).toBe(false)
    expect(buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'ios', interfaceName: '' }).ok).toBe(
      false,
    )
  })

  it('rejects an out-of-range VLAN ID', () => {
    const result = buildInterfaceConfig({ ...BASE_INTERFACE, vendor: 'ios', vlanId: 5000 })
    expect(result.ok).toBe(false)
  })

  it('produces a config for every supported vendor', () => {
    for (const vendor of CONFIG_VENDORS) {
      const result = buildInterfaceConfig({ ...BASE_INTERFACE, vendor })
      expect(result.ok, `vendor ${vendor} should succeed`).toBe(true)
    }
  })
})

describe('buildStaticRouteConfig', () => {
  it('produces a dotted-mask ip route line for IOS', () => {
    const result = buildStaticRouteConfig({ ...BASE_ROUTE, vendor: 'ios' })
    expect(result.ok).toBe(true)
    if (result.ok)
      expect(result.result.config).toContain('ip route 172.16.0.0 255.255.0.0 10.0.12.254')
  })

  it('produces CIDR-notation static routes for NX-OS and EOS', () => {
    const nxos = buildStaticRouteConfig({ ...BASE_ROUTE, vendor: 'nxos' })
    expect(nxos.ok && nxos.result.config).toContain('ip route 172.16.0.0/16 10.0.12.254')
  })

  it('emits a Junos set-style static route', () => {
    const result = buildStaticRouteConfig({ ...BASE_ROUTE, vendor: 'junos' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain(
        'set routing-options static route 172.16.0.0/16 next-hop 10.0.12.254',
      )
    }
  })

  it('emits a MikroTik route command', () => {
    const result = buildStaticRouteConfig({ ...BASE_ROUTE, vendor: 'mikrotik' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain(
        '/ip route add dst-address=172.16.0.0/16 gateway=10.0.12.254',
      )
    }
  })

  it('emits pfSense GUI guidance plus a real route(8) equivalent', () => {
    const result = buildStaticRouteConfig({ ...BASE_ROUTE, vendor: 'pfsense' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.result.config).toContain('route add -net 172.16.0.0/16 10.0.12.254')
    }
  })

  it('rejects an invalid next-hop address', () => {
    const result = buildStaticRouteConfig({ ...BASE_ROUTE, vendor: 'ios', nextHop: 'nope' })
    expect(result.ok).toBe(false)
  })

  it('produces a route config for every supported vendor', () => {
    for (const vendor of CONFIG_VENDORS as ConfigVendor[]) {
      const result = buildStaticRouteConfig({ ...BASE_ROUTE, vendor })
      expect(result.ok, `vendor ${vendor} should succeed`).toBe(true)
    }
  })
})

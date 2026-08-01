import { useRef, useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { GuidedMode, type GuidedStep } from '../GuidedMode'
import { BinaryBreakdown } from './BinaryBreakdown'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { Pill } from '../../../components/ui/Pill'
import { calculateSubnets, type SubnetInfo } from '../../../lib/calculations/subnet'
import {
  calculateVlsm,
  type VlsmAllocation,
  type VlsmRequest,
} from '../../../lib/calculations/vlsm'
import { ipv4ToString, parseCIDR, prefixLengthToSubnetMask } from '../../../lib/validation/ip'

function buildEqualCliSnippet(subnets: SubnetInfo[], mask: string): string {
  return subnets
    .map(
      (subnet, index) =>
        `interface Vlan${index + 1}\n description ${subnet.cidr}\n ip address ${subnet.firstUsable ?? 'n/a'} ${mask}`,
    )
    .join('\n!\n')
}

function buildVlsmCliSnippet(allocations: VlsmAllocation[]): string {
  return allocations
    .map((allocation) => {
      const mask = ipv4ToString(prefixLengthToSubnetMask(allocation.prefixLength).value)
      return `interface Vlan${allocation.id}\n description ${allocation.label || 'Unnamed subnet'}\n ip address ${allocation.firstUsable ?? 'n/a'} ${mask}`
    })
    .join('\n!\n')
}

// VLSM allocates largest-request-first to minimize fragmentation of the
// base block (see vlsm.ts) -- the guided walkthrough steps through that
// same real processing order, not the order requests happen to be listed
// in, so it shows what the algorithm actually did.
function buildVlsmSteps(
  allocations: VlsmAllocation[],
  baseCidr: string,
  addressesAvailable: number,
): GuidedStep[] {
  const ordered = [...allocations].sort((a, b) => b.hostsNeeded - a.hostsNeeded)
  let cumulative = 0

  return ordered.map((allocation) => {
    const blockSize = 2 ** (32 - allocation.prefixLength)
    cumulative += blockSize
    const usedPercent = Math.min(100, (cumulative / addressesAvailable) * 100)

    return {
      title: allocation.label || 'Unnamed subnet',
      description: `Needs ${allocation.hostsNeeded.toLocaleString()} usable hosts -- the smallest block that fits is a /${allocation.prefixLength} (${allocation.usableHosts.toLocaleString()} usable).`,
      content: (
        <div className="flex flex-col gap-3">
          <dl>
            <ResultRow label="Assigned" value={allocation.cidr} />
            <ResultRow
              label="Usable range"
              value={
                allocation.firstUsable && allocation.lastUsable
                  ? `${allocation.firstUsable} - ${allocation.lastUsable}`
                  : 'None'
              }
            />
          </dl>
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-fg-subtle/15">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-fg-subtle">
              {cumulative.toLocaleString()} / {addressesAvailable.toLocaleString()} addresses of{' '}
              {baseCidr} used so far
            </p>
          </div>
        </div>
      ),
    }
  })
}

type Mode = 'equal' | 'vlsm'

export function SubnetCalculator() {
  const [mode, setMode] = useState<Mode>('equal')
  const [cidrInput, setCidrInput] = useState('192.168.1.0/24')
  const [showCli, setShowCli] = useState(false)

  const [newPrefixInput, setNewPrefixInput] = useState('26')
  const equalCalc = calculateSubnets(cidrInput, Number(newPrefixInput))

  const nextRequestId = useRef(3)
  const [requests, setRequests] = useState<VlsmRequest[]>([
    { id: '1', label: 'Sales', hostsNeeded: 50 },
    { id: '2', label: 'Guest Wi-Fi', hostsNeeded: 10 },
  ])
  const vlsmCalc = calculateVlsm(cidrInput, requests)

  function updateRequest(id: string, patch: Partial<VlsmRequest>) {
    setRequests((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function addRequest() {
    const id = String(nextRequestId.current++)
    setRequests((current) => [...current, { id, label: '', hostsNeeded: 10 }])
  }

  function removeRequest(id: string) {
    setRequests((current) => current.filter((r) => r.id !== id))
  }

  const baseParsed = parseCIDR(cidrInput)

  return (
    <ToolPageLayout
      category="IP"
      title="Subnet calculator"
      description="Split a network into equal-sized subnets, or allocate variable-length (VLSM) subnets sized to what each one actually needs."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Pill active={mode === 'equal'} onClick={() => setMode('equal')}>
              Equal split
            </Pill>
            <Pill active={mode === 'vlsm'} onClick={() => setMode('vlsm')}>
              Variable (VLSM)
            </Pill>
          </div>

          <div>
            <label htmlFor="subnet-cidr" className="text-sm font-medium">
              Base network
            </label>
            <Input
              id="subnet-cidr"
              className="mt-2"
              value={cidrInput}
              onChange={(event) => setCidrInput(event.target.value)}
              placeholder="192.168.1.0/24"
              spellCheck={false}
            />
          </div>

          {mode === 'equal' ? (
            <div>
              <label htmlFor="subnet-new-prefix" className="text-sm font-medium">
                New prefix length
              </label>
              <Input
                id="subnet-new-prefix"
                className="mt-2"
                type="number"
                min={0}
                max={32}
                value={newPrefixInput}
                onChange={(event) => setNewPrefixInput(event.target.value)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Subnets needed</p>
              {requests.map((request) => (
                <div key={request.id} className="flex items-center gap-2">
                  <Input
                    value={request.label}
                    onChange={(event) => updateRequest(request.id, { label: event.target.value })}
                    placeholder="Name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={request.hostsNeeded}
                    onChange={(event) =>
                      updateRequest(request.id, { hostsNeeded: Number(event.target.value) })
                    }
                    placeholder="Hosts"
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeRequest(request.id)}
                    aria-label={`Remove ${request.label || 'subnet'}`}
                    className="rounded-md border border-border px-2 py-2 text-xs text-fg-muted hover:border-danger hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <Button variant="secondary" type="button" onClick={addRequest}>
                Add subnet
              </Button>
            </div>
          )}
        </div>
      }
      result={
        mode === 'equal' ? (
          equalCalc.ok ? (
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="Subnet mask" value={equalCalc.result.subnetMask} />
                <ResultRow
                  label="Number of subnets"
                  value={equalCalc.result.subnetCount.toLocaleString()}
                />
                <ResultRow
                  label="Hosts per subnet"
                  value={equalCalc.result.hostsPerSubnet.toLocaleString()}
                />
              </dl>
              {baseParsed && (
                <BinaryBreakdown
                  label="Base network in binary"
                  value={baseParsed.ip.value}
                  prefixLength={baseParsed.prefixLength}
                />
              )}
              <div className="max-h-80 overflow-y-auto rounded-md border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 font-medium text-fg-muted">Subnet</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Usable range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equalCalc.result.subnets.map((subnet) => (
                      <tr
                        key={subnet.cidr}
                        className="border-b border-border font-mono last:border-b-0"
                      >
                        <td className="px-3 py-2">{subnet.cidr}</td>
                        <td className="px-3 py-2">
                          {subnet.firstUsable && subnet.lastUsable
                            ? `${subnet.firstUsable} - ${subnet.lastUsable}`
                            : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                  {showCli ? 'Hide' : 'Show'} Cisco IOS config (expert)
                </Pill>
                {showCli && (
                  <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                    {buildEqualCliSnippet(equalCalc.result.subnets, equalCalc.result.subnetMask)}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-danger">{equalCalc.error}</p>
          )
        ) : vlsmCalc.ok ? (
          <GuidedMode
            steps={buildVlsmSteps(
              vlsmCalc.result.allocations,
              vlsmCalc.result.baseCidr,
              vlsmCalc.result.addressesAvailable,
            )}
            closingNote={
              <>
                VLSM allocates biggest request first -- fitting the large blocks in while there's
                still room for them is what leaves space for the small ones after, not the other way
                around. Request the same subnets in a different order and you'd get the exact same
                layout.
              </>
            }
          >
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="Base network" value={vlsmCalc.result.baseCidr} />
                <ResultRow
                  label="Addresses used"
                  value={`${vlsmCalc.result.addressesUsed.toLocaleString()} / ${vlsmCalc.result.addressesAvailable.toLocaleString()}`}
                />
              </dl>
              <div className="max-h-80 overflow-y-auto rounded-md border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 font-medium text-fg-muted">Name</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">CIDR</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">Usable range</th>
                      <th className="px-3 py-2 font-medium text-fg-muted">
                        Hosts (requested / available)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vlsmCalc.result.allocations.map((allocation) => {
                      const spare = allocation.usableHosts - allocation.hostsNeeded
                      return (
                        <tr
                          key={allocation.id}
                          className="border-b border-border font-mono last:border-b-0"
                        >
                          <td className="px-3 py-2 font-sans">{allocation.label || 'Unnamed'}</td>
                          <td className="px-3 py-2">{allocation.cidr}</td>
                          <td className="px-3 py-2">
                            {allocation.firstUsable && allocation.lastUsable
                              ? `${allocation.firstUsable} - ${allocation.lastUsable}`
                              : 'None'}
                          </td>
                          <td className="px-3 py-2">
                            {allocation.hostsNeeded.toLocaleString()} /{' '}
                            {allocation.usableHosts.toLocaleString()}
                            <span className="text-fg-subtle">
                              {' '}
                              ({spare.toLocaleString()} spare)
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div>
                <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                  {showCli ? 'Hide' : 'Show'} Cisco IOS config (expert)
                </Pill>
                {showCli && (
                  <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                    {buildVlsmCliSnippet(vlsmCalc.result.allocations)}
                  </pre>
                )}
              </div>
            </div>
          </GuidedMode>
        ) : (
          <p className="text-sm text-danger">{vlsmCalc.error}</p>
        )
      }
    />
  )
}

import { useRef, useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BinaryBreakdown } from './BinaryBreakdown'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { calculateSubnets } from '../../../lib/calculations/subnet'
import { calculateVlsm, type VlsmRequest } from '../../../lib/calculations/vlsm'
import { parseCIDR } from '../../../lib/validation/ip'

type Mode = 'equal' | 'vlsm'

function ModeButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border text-fg-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
}

export function SubnetCalculator() {
  const [mode, setMode] = useState<Mode>('equal')
  const [cidrInput, setCidrInput] = useState('192.168.1.0/24')

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
            <ModeButton
              label="Equal split"
              active={mode === 'equal'}
              onClick={() => setMode('equal')}
            />
            <ModeButton
              label="Variable (VLSM)"
              active={mode === 'vlsm'}
              onClick={() => setMode('vlsm')}
            />
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
                    className="rounded-md border border-border px-2 py-2 text-xs text-fg-muted hover:border-danger hover:text-danger"
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
            </div>
          ) : (
            <p className="text-sm text-danger">{equalCalc.error}</p>
          )
        ) : vlsmCalc.ok ? (
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
                          <span className="text-fg-subtle"> ({spare.toLocaleString()} spare)</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{vlsmCalc.error}</p>
        )
      }
    />
  )
}

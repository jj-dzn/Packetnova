import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateSubnets } from '../../../lib/calculations/subnet'

export function SubnetCalculator() {
  const [cidrInput, setCidrInput] = useState('192.168.1.0/24')
  const [newPrefixInput, setNewPrefixInput] = useState('26')
  const calc = calculateSubnets(cidrInput, Number(newPrefixInput))

  return (
    <ToolPageLayout
      category="IP"
      title="Subnet calculator"
      description="Split a network into equal-sized subnets and see the resulting masks and ranges."
      input={
        <div className="flex flex-col gap-4">
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
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="Subnet mask" value={calc.result.subnetMask} />
              <ResultRow
                label="Number of subnets"
                value={calc.result.subnetCount.toLocaleString()}
              />
              <ResultRow
                label="Hosts per subnet"
                value={calc.result.hostsPerSubnet.toLocaleString()}
              />
            </dl>
            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-fg-muted">Subnet</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Usable range</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.result.subnets.map((subnet) => (
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
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

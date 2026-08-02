import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { BitFieldDiagram } from '../BitFieldDiagram'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { calculateDot1qTag } from '../../../lib/calculations/dot1q'

// The standard IEEE 802.1p priority-to-traffic-class mapping -- the same 8
// values every PCP field ever holds, so naming them turns "5" into
// something a visitor actually recognizes (this is why VoIP configs
// specifically care about PCP 5).
const DOT1P_PRIORITIES = [
  { value: 0, label: '0 -- Best Effort (default)' },
  { value: 1, label: '1 -- Background' },
  { value: 2, label: '2 -- Excellent Effort' },
  { value: 3, label: '3 -- Critical Applications' },
  { value: 4, label: '4 -- Video (< 100ms latency)' },
  { value: 5, label: '5 -- Voice (< 10ms latency)' },
  { value: 6, label: '6 -- Internetwork Control' },
  { value: 7, label: '7 -- Network Control' },
]

export function Dot1qExplorer() {
  const [pcp, setPcp] = useState('0')
  const [dei, setDei] = useState('0')
  const [vlanId, setVlanId] = useState('100')

  const calc = calculateDot1qTag(Number(pcp), Number(dei), Number(vlanId))

  return (
    <ToolPageLayout
      category="Switching"
      title="802.1Q tag explorer"
      description="Build an 802.1Q tag from its PCP, DEI, and VLAN ID fields and see the resulting TCI and full tag."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="dot1q-pcp" className="text-sm font-medium">
              PCP -- Priority Code Point (0-7)
            </label>
            <Select
              id="dot1q-pcp"
              className="mt-2"
              value={pcp}
              onChange={(e) => setPcp(e.target.value)}
            >
              {DOT1P_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="dot1q-dei" className="text-sm font-medium">
              DEI (0 or 1)
            </label>
            <Input
              id="dot1q-dei"
              className="mt-2"
              value={dei}
              onChange={(e) => setDei(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="dot1q-vlan" className="text-sm font-medium">
              VLAN ID (0-4095)
            </label>
            <Input
              id="dot1q-vlan"
              className="mt-2"
              value={vlanId}
              onChange={(e) => setVlanId(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <dl>
              <ResultRow label="TPID" value="0x8100" />
              <ResultRow label="TCI" value={`0x${calc.result.tciHex}`} />
              <ResultRow label="Full tag" value={`0x${calc.result.fullTagHex}`} />
            </dl>
            <div>
              <p className="mb-1 text-xs font-medium text-fg-muted">TCI (16 bits) broken down</p>
              <BitFieldDiagram
                fields={[
                  { label: 'PCP', bits: 3, value: calc.result.pcp },
                  { label: 'DEI', bits: 1, value: calc.result.dei },
                  { label: 'VLAN ID', bits: 12, value: calc.result.vlanId },
                ]}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

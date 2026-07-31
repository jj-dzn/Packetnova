import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateDot1qTag } from '../../../lib/calculations/dot1q'

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
              PCP (0-7)
            </label>
            <Input
              id="dot1q-pcp"
              className="mt-2"
              value={pcp}
              onChange={(e) => setPcp(e.target.value)}
            />
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
          <dl>
            <ResultRow label="TPID" value="0x8100" />
            <ResultRow label="TCI" value={`0x${calc.result.tciHex}`} />
            <ResultRow label="Full tag" value={`0x${calc.result.fullTagHex}`} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

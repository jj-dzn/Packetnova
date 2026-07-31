import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { calculateMtu } from '../../../lib/calculations/mtu'

export function MtuCalculator() {
  const [linkMtu, setLinkMtu] = useState('1500')
  const [overhead, setOverhead] = useState('0')
  const [payload, setPayload] = useState('1500')

  const calc = calculateMtu(Number(linkMtu), Number(overhead), Number(payload))

  return (
    <ToolPageLayout
      category="VPN"
      title="MTU calculator"
      description="Find the right MTU for a link and see what happens when a given payload doesn't fit."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="mtu-link" className="text-sm font-medium">
              Link MTU (bytes)
            </label>
            <Input
              id="mtu-link"
              className="mt-2"
              value={linkMtu}
              onChange={(e) => setLinkMtu(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mtu-overhead" className="text-sm font-medium">
              Overhead (bytes)
            </label>
            <Input
              id="mtu-overhead"
              className="mt-2"
              value={overhead}
              onChange={(e) => setOverhead(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mtu-payload" className="text-sm font-medium">
              Payload size to test (bytes)
            </label>
            <Input
              id="mtu-payload"
              className="mt-2"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <dl>
            <ResultRow label="Effective MTU" value={`${calc.result.effectiveMtu} bytes`} />
            <ResultRow label="Fits?" value={calc.result.fits ? 'Yes' : 'No -- will fragment'} />
            <ResultRow label="Excess" value={`${calc.result.excessBytes} bytes`} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

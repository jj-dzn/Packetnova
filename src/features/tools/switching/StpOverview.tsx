import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { electRootBridge, type BridgeCandidate } from '../../../lib/calculations/stp'

const DEFAULT_BRIDGES: BridgeCandidate[] = [
  { id: 'Switch A', priority: 32768, macAddress: '00:11:22:33:44:55' },
  { id: 'Switch B', priority: 4096, macAddress: 'aa:bb:cc:dd:ee:ff' },
]

export function StpOverview() {
  const [bridges, setBridges] = useState<BridgeCandidate[]>(DEFAULT_BRIDGES)

  const calc = electRootBridge(bridges)

  function updateBridge(index: number, patch: Partial<BridgeCandidate>) {
    setBridges((current) => current.map((b, i) => (i === index ? { ...b, ...patch } : b)))
  }

  function removeBridge(index: number) {
    setBridges((current) => current.filter((_, i) => i !== index))
  }

  function addBridge() {
    setBridges((current) => [
      ...current,
      {
        id: `Switch ${String.fromCharCode(65 + current.length)}`,
        priority: 32768,
        macAddress: '00:00:00:00:00:00',
      },
    ])
  }

  return (
    <>
      <ToolPageLayout
        category="Switching"
        title="STP overview"
        description="Spanning Tree Protocol elects a root bridge by lowest Bridge ID -- priority first, MAC address as the tiebreaker -- then blocks any port that would form a loop to it."
        input={
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Bridges</span>
            {bridges.map((bridge, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                <Input
                  value={bridge.id}
                  onChange={(e) => updateBridge(index, { id: e.target.value })}
                  placeholder="Name"
                  className="min-w-[7rem] flex-1"
                />
                <Input
                  value={bridge.priority}
                  onChange={(e) => updateBridge(index, { priority: Number(e.target.value) })}
                  placeholder="Priority"
                  className="min-w-[7rem] flex-1"
                />
                <Input
                  value={bridge.macAddress}
                  onChange={(e) => updateBridge(index, { macAddress: e.target.value })}
                  placeholder="MAC address"
                  className="min-w-[9rem] flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => removeBridge(index)}
                  disabled={bridges.length <= 1}
                  aria-label="Remove bridge"
                >
                  &times;
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addBridge} className="self-start">
              + Add bridge
            </Button>
          </div>
        }
        result={
          calc.ok ? (
            <dl>
              <ResultRow label="Root bridge" value={calc.result.rootBridgeId} />
              <ResultRow label="Decided by" value={calc.result.decidedBy} />
            </dl>
          ) : (
            <p className="text-sm text-danger">{calc.error}</p>
          )
        }
      />
      <div className="pb-12">
        <h2 className="mb-4 text-lg font-semibold">How STP blocks loops</h2>
        <p className="max-w-2xl text-sm text-fg-muted">
          Once the root bridge is elected, every other switch picks a single root port (the
          lowest-cost path back to the root) and every network segment gets one designated port. Any
          other port that would create a second path to the root is put into a blocking state --
          traffic-forwarding-wise inactive, but still listening for topology changes. That's how STP
          keeps a physically redundant, loop-having topology loop-free logically.
        </p>
      </div>
    </>
  )
}

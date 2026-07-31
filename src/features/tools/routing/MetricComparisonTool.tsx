import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { Input } from '../../../components/ui/Input'
import { DataTable } from '../../../components/ui/DataTable'
import { calculateOspfCost } from '../../../lib/calculations/ospfCost'
import { routingMetrics, type MetricInfo } from '../../../content/reference/routingMetrics'

export function MetricComparisonTool() {
  const [refBandwidth, setRefBandwidth] = useState('100')
  const [ifBandwidth, setIfBandwidth] = useState('1000')

  const calc = calculateOspfCost(Number(refBandwidth), Number(ifBandwidth))

  return (
    <>
      <ToolPageLayout
        category="Routing"
        title="Metric comparison tool"
        description="Routing metrics aren't directly comparable across protocols -- this covers how each one is calculated, plus a quick OSPF cost calculator."
        input={
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="metric-ref-bw" className="text-sm font-medium">
                OSPF reference bandwidth (Mbps)
              </label>
              <Input
                id="metric-ref-bw"
                className="mt-2"
                value={refBandwidth}
                onChange={(e) => setRefBandwidth(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="metric-if-bw" className="text-sm font-medium">
                Interface bandwidth (Mbps)
              </label>
              <Input
                id="metric-if-bw"
                className="mt-2"
                value={ifBandwidth}
                onChange={(e) => setIfBandwidth(e.target.value)}
              />
            </div>
          </div>
        }
        result={
          calc.ok ? (
            <div className="flex flex-col gap-4">
              <dl>
                <ResultRow label="OSPF cost" value={String(calc.result.cost)} />
              </dl>
              {calc.result.cost === 1 &&
                calc.result.interfaceBandwidthMbps >= calc.result.referenceBandwidthMbps && (
                  <Aside>
                    This interface is already floored out at the minimum cost of 1, because{' '}
                    {calc.result.interfaceBandwidthMbps} Mbps is at or above your{' '}
                    {calc.result.referenceBandwidthMbps} Mbps reference bandwidth. Any faster
                    interface would get the same cost, so OSPF can no longer tell them apart -- this
                    is exactly why real deployments raise the reference bandwidth with{' '}
                    <code className="font-mono">auto-cost reference-bandwidth</code> once links
                    exceed it.
                  </Aside>
                )}
            </div>
          ) : (
            <p className="text-sm text-danger">{calc.error}</p>
          )
        }
      />
      <div className="pb-12">
        <h2 className="mb-4 text-lg font-semibold">How each protocol measures distance</h2>
        <DataTable<MetricInfo>
          columns={[
            { key: 'protocol', label: 'Protocol' },
            { key: 'metricType', label: 'Metric type' },
            { key: 'description', label: 'How it works' },
          ]}
          rows={routingMetrics}
        />
      </div>
    </>
  )
}

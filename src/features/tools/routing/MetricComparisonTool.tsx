import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Aside } from '../Aside'
import { ToolEducation } from '../ToolEducation'
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
        description="Routing metrics aren't directly comparable across protocols: an OSPF cost of 10 and an EIGRP composite metric of 10 don't mean anything relative to each other -- they're not even the same unit. This covers how each protocol calculates its own metric, plus a quick OSPF cost calculator below."
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
        <p className="mb-4 max-w-2xl text-sm text-fg-muted">
          The cost calculated above is OSPF's answer specifically -- inverse bandwidth, scaled by
          the reference bandwidth you set. Every other protocol below answers the same underlying
          question ("how far is this route?") with a completely different formula and a
          differently-scaled number, which is exactly why you can't compare a "cost" from one row to
          a "metric" from another.
        </p>
        <DataTable<MetricInfo>
          columns={[
            { key: 'protocol', label: 'Protocol' },
            { key: 'metricType', label: 'Metric type' },
            { key: 'description', label: 'How it works' },
          ]}
          rows={routingMetrics}
        />
        <div className="mt-6 max-w-2xl">
          <ToolEducation
            howItWorks={
              <p>
                Every routing protocol needs some number to decide "which path is better" when more
                than one exists to the same destination. Each one defines that number differently --
                RIP simply counts hops, OSPF uses bandwidth-derived cost, EIGRP combines bandwidth
                and delay into a composite value, and BGP doesn't use a single metric at all,
                deciding instead through a sequence of path attributes.
              </p>
            }
            whenToUseThis={
              <p>
                Use the calculator above to work out an interface's actual OSPF cost given your
                network's reference bandwidth. Use the table to understand what a metric from a
                different protocol actually represents when you're reading a routing table that
                mixes sources.
              </p>
            }
            commonMistakes={
              <p>
                Comparing OSPF cost directly against EIGRP's composite metric as if a smaller number
                always means a better path across protocols -- it doesn't, because they're not the
                same unit. Metric only matters within a single protocol; when a router learns the
                same route from two different protocols, administrative distance (not metric) is
                what decides between them.
              </p>
            }
            troubleshootingTips={
              <p>
                If OSPF cost isn't differentiating between links the way you'd expect, check whether
                the reference bandwidth is still at its classic default -- on modern high-bandwidth
                links, many interfaces floor out at the same minimum cost and become
                indistinguishable to OSPF until the reference bandwidth is raised.
              </p>
            }
            relatedReading={
              <p>
                See how administrative distance (not metric) breaks ties between routes from
                different sources in the{' '}
                <Link
                  to="/tools/administrative-distance-reference"
                  className="text-accent hover:underline"
                >
                  Administrative distance reference
                </Link>
                .
              </p>
            }
          />
        </div>
      </div>
    </>
  )
}

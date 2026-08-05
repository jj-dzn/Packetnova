import { Link } from 'react-router'
import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { BgpBestPathSelector } from '../tools/routing/BgpBestPathSelector'
import { BgpBestPathVisualizer } from '../visualizers/BgpBestPathVisualizer'

export function BgpPathSelectionScenario() {
  return (
    <ScenarioPageLayout
      category="Routing"
      title="BGP path selection: why is traffic taking the long way"
      setup={
        <>
          <p>
            Two paths exist to the same destination prefix. Traffic is consistently choosing the
            path with more AS hops -- the "longer" one by any naive reading -- and it isn't a
            misconfiguration. BGP is correctly following its own tie-breaking order, which most
            people don't expect to run this deep before AS-path length ever gets checked.
          </p>
        </>
      }
      resolution={
        <>
          <p>
            Local preference was set higher on the path most people expected to lose, by a previous
            engineer deliberately steering traffic toward a specific egress point. BGP was never
            broken -- local preference simply outranks AS-path length, and it's checked second, not
            first. Nothing needed fixing except the assumption about which attribute matters most.
          </p>
          <p>
            <Link to="/journey/bgp-path" className="text-accent hover:underline">
              Walk the full tie-break order end to end in the BGP path journey.
            </Link>{' '}
            or start from the beginning with the{' '}
            <Link to="/paths/bgp-path-selection" className="text-accent hover:underline">
              BGP path selection path
            </Link>
            .
          </p>
        </>
      }
    >
      <ScenarioStage
        number={1}
        title="Build the exact comparison yourself"
        narration="Enter the two competing paths' real attributes -- weight, local preference, AS-path length, and the rest -- and see exactly which one wins and which single attribute actually decided it."
      >
        <BgpBestPathSelector />
      </ScenarioStage>

      <ScenarioStage
        number={2}
        title="Watch the same tie-breaking order on a fixed example"
        narration="The identical elimination order -- weight first, then local preference, then everything below it -- played out step by step, one attribute at a time."
      >
        <BgpBestPathVisualizer />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}

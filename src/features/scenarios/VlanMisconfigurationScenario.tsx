import { ScenarioPageLayout, ScenarioStage } from './ScenarioPageLayout'
import { VlanCalculator } from '../tools/switching/VlanCalculator'
import { Dot1qExplorer } from '../tools/switching/Dot1qExplorer'

export function VlanMisconfigurationScenario() {
  return (
    <ScenarioPageLayout
      category="Switching"
      title="VLAN misconfiguration: why can't these two hosts talk"
      setup={
        <>
          <p>
            Two hosts are plugged into the same physical switch, in what's supposed to be the same
            VLAN, and they can't reach each other. Nothing about the cabling changed, and nothing on
            either host looks wrong.
          </p>
          <p>
            The problem isn't the wire between them -- it's which broadcast domain each port
            actually belongs to.
          </p>
        </>
      }
      resolution={
        <p>
          One access port was left assigned to the default VLAN 1 instead of the intended VLAN 100.
          Both hosts, both cabled correctly, just quietly living on two different broadcast domains
          that happen to share a switch. Re-assigning the port's access VLAN fixed it instantly --
          no trunk or tagging change needed, because the traffic between these two ports was never
          supposed to be tagged in the first place.
        </p>
      }
    >
      <ScenarioStage
        number={1}
        title="Confirm the VLAN both hosts are supposed to share"
        narration="Check the intended VLAN ID's validity and hex representation, and see the diagram of where a tag would actually apply -- and, just as important, where it wouldn't. Access ports carry frames untagged; only a trunk between switches carries the 802.1Q tag at all."
      >
        <VlanCalculator />
      </ScenarioStage>

      <ScenarioStage
        number={2}
        title="Check the tag itself, in case a trunk is involved"
        narration="If these hosts sit behind different switches connected by a trunk, build the actual 802.1Q tag that trunk should be carrying and confirm the VLAN ID field matches what both access ports are configured for."
      >
        <Dot1qExplorer />
      </ScenarioStage>
    </ScenarioPageLayout>
  )
}

import { LayerExplorer } from './LayerExplorer'
import { OSI_LAYERS } from '../../content/reference/networkStackLayers'

export function OsiModelExplorer() {
  return (
    <LayerExplorer
      category="Visualizer"
      title="OSI model explorer"
      description="Click through each OSI layer and see what happens to data at each one."
      layers={OSI_LAYERS}
      related={[
        { to: '/visualizers/tcp-ip-stack-explorer', label: 'TCP/IP stack explorer' },
        { to: '/visualizers/packet-encapsulation', label: 'Packet encapsulation' },
      ]}
    />
  )
}

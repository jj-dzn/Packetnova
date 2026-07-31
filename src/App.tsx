import { BrowserRouter, Routes, Route } from 'react-router'
import { PageShell } from './components/layout/PageShell'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { SearchPage } from './pages/SearchPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CidrCalculator } from './features/tools/ip/CidrCalculator'
import { SubnetCalculator } from './features/tools/ip/SubnetCalculator'
import { IpRangeCalculator } from './features/tools/ip/IpRangeCalculator'
import { BroadcastCalculator } from './features/tools/ip/BroadcastCalculator'
import { NetworkAddressCalculator } from './features/tools/ip/NetworkAddressCalculator'
import { MtuCalculator } from './features/tools/vpn/MtuCalculator'
import { MssCalculator } from './features/tools/vpn/MssCalculator'
import { LatencyCalculator } from './features/tools/vpn/LatencyCalculator'
import { TransferTimeCalculator } from './features/tools/vpn/TransferTimeCalculator'
import { BandwidthEstimator } from './features/tools/vpn/BandwidthEstimator'
import { TunnelOverheadCalculator } from './features/tools/vpn/TunnelOverheadCalculator'
import { PacketFragmentationCalculator } from './features/tools/vpn/PacketFragmentationCalculator'

function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/cidr-calculator" element={<CidrCalculator />} />
          <Route path="/tools/subnet-calculator" element={<SubnetCalculator />} />
          <Route path="/tools/ip-range-calculator" element={<IpRangeCalculator />} />
          <Route path="/tools/broadcast-calculator" element={<BroadcastCalculator />} />
          <Route path="/tools/network-address-calculator" element={<NetworkAddressCalculator />} />
          <Route path="/tools/mtu-calculator" element={<MtuCalculator />} />
          <Route path="/tools/mss-calculator" element={<MssCalculator />} />
          <Route path="/tools/latency-calculator" element={<LatencyCalculator />} />
          <Route path="/tools/transfer-time-calculator" element={<TransferTimeCalculator />} />
          <Route path="/tools/bandwidth-estimator" element={<BandwidthEstimator />} />
          <Route
            path="/tools/vpn-tunnel-overhead-calculator"
            element={<TunnelOverheadCalculator />}
          />
          <Route
            path="/tools/packet-fragmentation-calculator"
            element={<PacketFragmentationCalculator />}
          />
          <Route path="/visualizers" element={<ComingSoonPage title="Visualizers" />} />
          <Route path="/blog" element={<ComingSoonPage title="Blog" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  )
}

export default App

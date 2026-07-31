import { BrowserRouter, Routes, Route } from 'react-router'
import { PageShell } from './components/layout/PageShell'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CidrCalculator } from './features/tools/ip/CidrCalculator'
import { SubnetCalculator } from './features/tools/ip/SubnetCalculator'
import { IpRangeCalculator } from './features/tools/ip/IpRangeCalculator'
import { BroadcastCalculator } from './features/tools/ip/BroadcastCalculator'
import { NetworkAddressCalculator } from './features/tools/ip/NetworkAddressCalculator'

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
          <Route path="/visualizers" element={<ComingSoonPage title="Visualizers" />} />
          <Route path="/blog" element={<ComingSoonPage title="Blog" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  )
}

export default App

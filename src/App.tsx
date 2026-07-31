import { BrowserRouter, Routes, Route } from 'react-router'
import { PageShell } from './components/layout/PageShell'
import { HomePage } from './pages/HomePage'
import { ToolsPage } from './pages/ToolsPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <PageShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/visualizers" element={<ComingSoonPage title="Visualizers" />} />
          <Route path="/blog" element={<ComingSoonPage title="Blog" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageShell>
    </BrowserRouter>
  )
}

export default App

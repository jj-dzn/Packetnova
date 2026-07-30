import { PageShell } from './components/layout/PageShell'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Badge } from './components/ui/Badge'
import { useDarkMode } from './hooks/useDarkMode'

function App() {
  const { theme, toggleTheme } = useDarkMode()

  return (
    <PageShell>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 py-16 text-center">
        <img src="/logo.svg" alt="" width={48} height={48} />
        <Badge tone="accent">Foundation</Badge>
        <h1 className="text-2xl font-semibold">PacketNova</h1>
        <p className="max-w-md text-fg-muted">
          Networking tools built for engineers. Calculators, protocol explorers, and interactive
          visualizers -- all client-side, all free.
        </p>
        <Card interactive className="max-w-sm text-left">
          <p className="text-sm text-fg-muted">
            Design system online: theme, dark mode, and core components are wired up.
          </p>
        </Card>
        <div className="flex gap-3">
          <Button onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'light' : 'dark'} mode
          </Button>
          <Button variant="secondary">Secondary action</Button>
        </div>
      </div>
    </PageShell>
  )
}

export default App

import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { generateCursedConfig } from '../../lib/labs/cursedConfig'

export function CursedConfigGenerator() {
  const [config, setConfig] = useState(() => generateCursedConfig())
  const [copied, setCopied] = useState(false)

  function regenerate() {
    setConfig(generateCursedConfig())
    setCopied(false)
  }

  async function copyConfig() {
    await navigator.clipboard.writeText(config)
    setCopied(true)
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Fun Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Cursed router config generator</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Authentic-looking CLI syntax, completely fake settings. Do not paste into production.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <pre className="overflow-x-auto whitespace-pre rounded-md border border-border bg-bg p-4 font-mono text-sm text-fg">
          {config}
        </pre>
        <div className="flex flex-wrap gap-3">
          <Button onClick={regenerate}>Generate another</Button>
          <Button variant="secondary" onClick={copyConfig}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

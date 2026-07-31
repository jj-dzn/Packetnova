import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { generateHandle, type HackerHandle } from '../../lib/labs/handleGenerator'

export function HandleGenerator() {
  const [current, setCurrent] = useState<HackerHandle>(() => generateHandle())
  const [copied, setCopied] = useState(false)

  function regenerate() {
    setCurrent(generateHandle())
    setCopied(false)
  }

  async function copyHandle() {
    await navigator.clipboard.writeText(current.handle)
    setCopied(true)
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Cyberpunk handle generator</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Every hacker in every 90s movie had a name like this. Now you do too.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-12 text-center">
        <Badge tone="accent">{current.clearance}</Badge>
        <p className="text-3xl font-semibold tracking-wide text-accent">{current.handle}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={regenerate}>Generate another</Button>
          <Button variant="secondary" onClick={copyHandle}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

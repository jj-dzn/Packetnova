import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { randomIpString, zodiacForIpString } from '../../lib/labs/ipZodiac'

export function IpZodiac() {
  const [input, setInput] = useState('')
  const [revealed, setRevealed] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reveal(ip: string) {
    const result = zodiacForIpString(ip)
    if (!result) {
      setError("That doesn't look like a valid IPv4 address.")
      setRevealed(null)
      return
    }
    setError(null)
    setRevealed(ip)
  }

  function handleSurprise() {
    const ip = randomIpString()
    setInput(ip)
    reveal(ip)
  }

  const result = revealed ? zodiacForIpString(revealed) : null

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">IP address zodiac</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Every IP has a sign. Enter one and find out what the octets say about it. Not astrology --
          just arithmetic wearing a costume.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="192.168.1.1"
            spellCheck={false}
            onKeyDown={(event) => {
              if (event.key === 'Enter') reveal(input)
            }}
          />
          <Button onClick={() => reveal(input)}>Reveal</Button>
        </div>
        <button
          type="button"
          onClick={handleSurprise}
          className="rounded text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Surprise me with a random IP
        </button>

        {error && <p className="text-sm text-danger">{error}</p>}

        {result && (
          <div className="mt-4 max-w-md">
            <p className="text-xs text-fg-subtle">{revealed}</p>
            <h2 className="mt-1 text-2xl font-semibold text-accent">{result.sign.name}</h2>
            <p className="mt-2 text-sm text-fg-muted">{result.sign.trait}</p>
            <p className="mt-4 text-sm italic text-fg">"{result.horoscope}"</p>
          </div>
        )}
      </Card>
    </div>
  )
}

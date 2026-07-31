import { useEffect, useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { verifyHash, HASH_ALGORITHMS, type HashAlgorithm } from '../../../lib/calculations/hash'

export function HashVerifier() {
  const [text, setText] = useState('Hello, PacketNova!')
  const [expected, setExpected] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [computed, setComputed] = useState<string | null>(null)
  const [matches, setMatches] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const buffer = new TextEncoder().encode(text).buffer as ArrayBuffer
      const result = await verifyHash(buffer, algorithm, expected)
      if (!cancelled) {
        setComputed(result.computed)
        setMatches(expected.trim() ? result.matches : null)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [text, expected, algorithm])

  return (
    <ToolPageLayout
      category="Security"
      title="Hash verifier"
      description="Check a string against an expected hash -- computed entirely in your browser."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="verify-text" className="text-sm font-medium">
              Text
            </label>
            <textarea
              id="verify-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="verify-algorithm" className="text-sm font-medium">
              Algorithm
            </label>
            <Select
              id="verify-algorithm"
              className="mt-2"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
            >
              {HASH_ALGORITHMS.map((alg) => (
                <option key={alg} value={alg}>
                  {alg}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="verify-expected" className="text-sm font-medium">
              Expected hash
            </label>
            <Input
              id="verify-expected"
              className="mt-2"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>
      }
      result={
        <dl>
          <ResultRow label="Computed" value={computed ?? '...'} />
          <ResultRow
            label="Match?"
            value={matches === null ? 'Enter an expected hash' : matches ? 'Yes' : 'No'}
          />
        </dl>
      }
    />
  )
}

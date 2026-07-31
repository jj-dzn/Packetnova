import { useEffect, useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Select } from '../../../components/ui/Select'
import {
  computeHash,
  HASH_ALGORITHMS,
  SecureContextRequiredError,
  type HashAlgorithm,
} from '../../../lib/calculations/hash'

export function HashGenerator() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [text, setText] = useState('Hello, PacketNova!')
  const [file, setFile] = useState<File | null>(null)
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [hash, setHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)
      try {
        const buffer =
          mode === 'text'
            ? new TextEncoder().encode(text).buffer
            : file
              ? await file.arrayBuffer()
              : null
        if (!buffer) {
          if (!cancelled) setHash(null)
          return
        }
        const result = await computeHash(buffer as ArrayBuffer, algorithm)
        if (!cancelled) setHash(result)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof SecureContextRequiredError ? err.message : 'Could not hash that input.',
          )
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [mode, text, file, algorithm])

  return (
    <ToolPageLayout
      category="Security"
      title="Hash generator"
      description="Generate MD5, SHA-1, SHA-256, SHA-384, or SHA-512 hashes from text or a file -- entirely in your browser, nothing uploaded."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={`rounded-md border px-3 py-1.5 text-sm ${mode === 'text' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={`rounded-md border px-3 py-1.5 text-sm ${mode === 'file' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              File
            </button>
          </div>
          {mode === 'text' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          ) : (
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          )}
          <div>
            <label htmlFor="hash-algorithm" className="text-sm font-medium">
              Algorithm
            </label>
            <Select
              id="hash-algorithm"
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
        </div>
      }
      result={
        error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : hash ? (
          <dl>
            <ResultRow label={algorithm} value={hash} />
          </dl>
        ) : (
          <p className="text-sm text-fg-muted">
            {mode === 'file' ? 'Choose a file to hash it.' : 'Computing...'}
          </p>
        )
      }
    />
  )
}

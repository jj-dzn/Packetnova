import { useEffect, useRef, useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { Select } from '../../../components/ui/Select'
import { CopyButton } from '../../../components/ui/CopyButton'
import { Skeleton } from '../../../components/ui/Skeleton'
import {
  computeHash,
  HASH_ALGORITHMS,
  SecureContextRequiredError,
  type HashAlgorithm,
} from '../../../lib/calculations/hash'

function AvalancheHash({ hash, previousHash }: { hash: string; previousHash: string | null }) {
  if (!previousHash || previousHash.length !== hash.length) {
    return <span className="break-all font-mono">{hash}</span>
  }
  const changedCount = hash.split('').filter((c, i) => c !== previousHash[i]).length
  return (
    <span className="break-all font-mono">
      {hash.split('').map((char, i) => (
        <span
          key={i}
          className={
            char !== previousHash[i] ? 'animate-pn-avalanche-flash text-accent' : undefined
          }
        >
          {char}
        </span>
      ))}
      {changedCount > 0 && (
        <span className="ml-2 whitespace-nowrap font-sans text-xs text-fg-subtle">
          ({Math.round((changedCount / hash.length) * 100)}% of characters changed)
        </span>
      )}
    </span>
  )
}

export function HashGenerator() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [text, setText] = useState('Hello, PacketNova!')
  const [file, setFile] = useState<File | null>(null)
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [hash, setHash] = useState<string | null>(null)
  const [previousHash, setPreviousHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const hashRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)
      setIsComputing(true)
      try {
        const buffer =
          mode === 'text'
            ? new TextEncoder().encode(text).buffer
            : file
              ? await file.arrayBuffer()
              : null
        if (!buffer) {
          if (!cancelled) {
            setHash(null)
            setIsComputing(false)
          }
          return
        }
        const result = await computeHash(buffer as ArrayBuffer, algorithm)
        if (!cancelled) {
          setPreviousHash(hashRef.current)
          hashRef.current = result
          setHash(result)
          setIsComputing(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof SecureContextRequiredError ? err.message : 'Could not hash that input.',
          )
          setIsComputing(false)
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
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'text' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'file' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
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
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <span className="shrink-0 text-sm text-fg-muted">{algorithm}</span>
            <span className="flex min-w-0 items-center justify-end gap-1.5">
              <span className="min-w-0 text-right text-sm">
                <AvalancheHash hash={hash} previousHash={previousHash} />
              </span>
              <CopyButton value={hash} label={algorithm} />
            </span>
          </div>
        ) : isComputing ? (
          <div className="flex items-center justify-between gap-4 border-b border-border py-2">
            <span className="shrink-0 text-sm text-fg-muted">{algorithm}</span>
            <Skeleton className="h-4 w-40" />
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            {mode === 'file' ? 'Choose a file to hash it.' : 'Enter some text to hash.'}
          </p>
        )
      }
    />
  )
}

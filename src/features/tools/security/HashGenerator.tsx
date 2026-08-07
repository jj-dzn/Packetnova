import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Select } from '../../../components/ui/Select'
import { CopyButton } from '../../../components/ui/CopyButton'
import { Skeleton } from '../../../components/ui/Skeleton'
import { Pill } from '../../../components/ui/Pill'
import {
  computeHash,
  HASH_ALGORITHMS,
  SecureContextRequiredError,
  type HashAlgorithm,
} from '../../../lib/calculations/hash'
import { buildHashCliSnippet } from '../../../content/reference/hashCliSnippets'

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
            char !== previousHash[i]
              ? 'motion-safe:animate-pn-avalanche-flash text-accent'
              : undefined
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
  const [showCli, setShowCli] = useState(false)
  const hashRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)
      setIsComputing(true)
      try {
        const buffer =
          mode === 'text'
            ? text
              ? new TextEncoder().encode(text).buffer
              : null
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
      status={error ? 'error' : hash ? 'ok' : undefined}
      related={[{ to: '/tools/hash-verifier', label: 'Hash verifier' }]}
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Pill active={mode === 'text'} onClick={() => setMode('text')}>
              Text
            </Pill>
            <Pill active={mode === 'file'} onClick={() => setMode('file')}>
              File
            </Pill>
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 border-b border-border py-2">
              <span className="shrink-0 text-sm text-fg-muted">{algorithm}</span>
              <span className="flex min-w-0 items-center justify-end gap-1.5">
                <span className="min-w-0 text-right text-sm">
                  <AvalancheHash hash={hash} previousHash={previousHash} />
                </span>
                <CopyButton value={hash} label={algorithm} />
              </span>
            </div>
            <div>
              <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                {showCli ? 'Hide' : 'Show'} CLI equivalent (expert)
              </Pill>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {buildHashCliSnippet(algorithm)}
                </pre>
              )}
            </div>
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
    >
      <ToolEducation
        howItWorks={
          <p>
            A hash function takes any input -- a word, a file, a gigabyte of video -- and produces a
            fixed-length "fingerprint" of it. The same input always produces the same hash, changing
            even one byte produces a completely different hash (the avalanche effect demonstrated
            above), and there's no way to run the process backwards to recover the original input
            from the hash alone.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to verify that a file wasn't corrupted or tampered with -- hash it yourself and
            compare against a checksum the publisher already gave you (an ISO image, an installer, a
            downloaded package). Don't use raw hashes like these to store passwords: they're fast by
            design, which is exactly wrong for password storage -- a dedicated password-hashing
            function (bcrypt, scrypt, Argon2) that's deliberately slow is what actually belongs
            there.
          </p>
        }
        commonMistakes={
          <p>
            Treating MD5 or SHA-1 as secure for anything beyond casual integrity checks -- both have
            practical collision attacks and shouldn't be relied on where an adversary could benefit
            from forging a match. Confusing hashing with encryption: a hash can't be decrypted
            because it was never encrypted, it's a one-way summary, not a reversible transformation.
          </p>
        }
        troubleshootingTips={
          <p>
            If your hash doesn't match a published checksum, check for trailing whitespace or a
            trailing newline in whatever you pasted, confirm you copied the entire hash (a single
            missing character will never match), and make sure text mode and file mode are actually
            hashing the same bytes -- a text file with different line endings (CRLF vs. LF) hashes
            differently even though it "looks" identical.
          </p>
        }
        relatedReading={
          <p>
            Got a hash to check instead of generate?{' '}
            <Link to="/tools/hash-verifier" className="text-accent hover:underline">
              Hash verifier
            </Link>{' '}
            does the comparison for you.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

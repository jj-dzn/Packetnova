import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Pill } from '../../../components/ui/Pill'
import {
  verifyHash,
  HASH_ALGORITHMS,
  SecureContextRequiredError,
  type HashAlgorithm,
} from '../../../lib/calculations/hash'
import { buildHashCliSnippet } from '../../../content/reference/hashCliSnippets'

export function HashVerifier() {
  const [text, setText] = useState('Hello, PacketNova!')
  const [expected, setExpected] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256')
  const [computed, setComputed] = useState<string | null>(null)
  const [matches, setMatches] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isComputing, setIsComputing] = useState(false)
  const [showCli, setShowCli] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setError(null)
      setIsComputing(true)
      try {
        const buffer = new TextEncoder().encode(text).buffer as ArrayBuffer
        const result = await verifyHash(buffer, algorithm, expected)
        if (!cancelled) {
          setComputed(result.computed)
          setMatches(expected.trim() ? result.matches : null)
          setIsComputing(false)
        }
      } catch (err) {
        if (!cancelled) {
          setComputed(null)
          setMatches(null)
          setError(
            err instanceof SecureContextRequiredError
              ? err.message
              : 'Could not verify that input.',
          )
          setIsComputing(false)
        }
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
      status={error ? 'error' : computed ? 'ok' : undefined}
      related={[{ to: '/tools/hash-generator', label: 'Hash generator' }]}
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
        error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <VerdictBanner matches={matches} isComputing={isComputing} />
            <dl>
              <ResultRow label="Computed" value={computed ?? ''} loading={isComputing} />
            </dl>
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
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            This recomputes the hash of what you typed using the algorithm you picked, then compares
            it character-for-character against the expected hash you pasted in (case and surrounding
            whitespace are ignored, since those differ harmlessly between tools and platforms
            without meaning anything about the actual content). A match means the two inputs are
            byte-for-byte identical; anything else means they aren't.
          </p>
        }
        whenToUseThis={
          <p>
            The most common real use: you downloaded a file (an ISO, an installer, a release
            archive) and the publisher listed a checksum next to it. Hash the file yourself and
            paste their published value in here -- a match means what you got is exactly what they
            built, not something corrupted in transit or swapped out by someone in between.
          </p>
        }
        commonMistakes={
          <p>
            Comparing a hash computed with one algorithm against an expected value that was
            published for a different one -- a SHA-256 hash will never match a published MD5
            checksum, even for identical content, because they're different functions entirely.
            Always confirm which algorithm the expected hash was actually generated with before
            assuming a mismatch means something's wrong with the file.
          </p>
        }
        troubleshootingTips={
          <p>
            If a hash you expect to match doesn't, first double-check the algorithm selector matches
            what the checksum was published as. If that's right, the mismatch is real -- re-download
            the file rather than trusting a copy that failed verification.
          </p>
        }
        relatedReading={
          <p>
            Need to generate a hash instead of check one?{' '}
            <Link to="/tools/hash-generator" className="text-accent hover:underline">
              Hash generator
            </Link>{' '}
            computes hashes from text or a file directly.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

// A single, unmissable verdict fills the top of the panel instead of a
// quiet "Match? Yes/No" table row -- this tool's entire purpose is that one
// answer, so it gets treated with the same visual weight as the stakes of
// getting it wrong (trusting a corrupted or tampered file).
function VerdictBanner({
  matches,
  isComputing,
}: {
  matches: boolean | null
  isComputing: boolean
}) {
  if (isComputing) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-5 text-center text-sm text-fg-subtle">
        Computing…
      </div>
    )
  }

  if (matches === null) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-fg-subtle">
        Enter an expected hash below to compare against.
      </div>
    )
  }

  if (matches) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-5 text-success"
      >
        <CheckIcon />
        <span className="text-lg font-semibold">Match</span>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-4 py-5 text-danger"
    >
      <CrossIcon />
      <span className="text-lg font-semibold">No match</span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

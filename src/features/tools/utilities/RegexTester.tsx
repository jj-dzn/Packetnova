import { useEffect, useState, type ReactNode } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Input } from '../../../components/ui/Input'
import { Pill } from '../../../components/ui/Pill'
import { CopyButton } from '../../../components/ui/CopyButton'
import { testRegex, type RegexMatch, type RegexResult } from '../../../lib/calculations/regexTester'
import { explainPattern } from '../../../lib/calculations/regexExplainer'
import type { CalculationResult } from '../../../lib/calculations/result'
import { useUrlState } from '../../../hooks/useUrlState'

const DEBOUNCE_MS = 150
const EVAL_TIMEOUT_MS = 750
const GROUP_BREAKDOWN_LIMIT = 200

// Python uses (?P<name>...) for a named group, not JS's (?<name>...) --
// copying a JS pattern with named groups into Python as-is would be a
// syntax error, so this rewrites just that one piece of syntax. The
// negative lookahead excludes (?<= and (?<! (lookbehind), which must stay
// untouched.
function toPythonNamedGroups(pattern: string): string {
  return pattern.replace(/\(\?<(?![=!])/g, '(?P<')
}

function buildRegexExports(pattern: string, flags: string): { label: string; code: string }[] {
  const pyFlagParts: string[] = []
  if (flags.includes('i')) pyFlagParts.push('re.IGNORECASE')
  if (flags.includes('m')) pyFlagParts.push('re.MULTILINE')
  if (flags.includes('s')) pyFlagParts.push('re.DOTALL')
  const pyFlagsArg = pyFlagParts.length > 0 ? `, ${pyFlagParts.join(' | ')}` : ''

  const grepFlags = ['-P', flags.includes('i') ? '-i' : ''].filter(Boolean).join(' ')

  return [
    { label: 'JavaScript', code: `/${pattern}/${flags}` },
    {
      label: 'Python',
      code: `re.compile(r"${toPythonNamedGroups(pattern)}"${pyFlagsArg})`,
    },
    { label: 'grep (PCRE)', code: `grep ${grepFlags} '${pattern}' file.txt` },
  ]
}

function renderHighlighted(text: string, matches: RegexMatch[]): ReactNode {
  if (matches.length === 0) return text

  const parts: ReactNode[] = []
  let lastIndex = 0
  matches.forEach((match, i) => {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <mark key={i} className="rounded bg-accent/30 px-0.5 text-fg">
        {match.match || '​'}
      </mark>,
    )
    lastIndex = match.index + match.match.length
  })
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export function RegexTester() {
  const [pattern, setPattern] = useUrlState('pattern', '#(?<id>\\d+)')
  const [flags, setFlags] = useUrlState('flags', 'g')
  const [text, setText] = useUrlState('text', 'Order #123 shipped, invoice #456 pending.')
  const [calc, setCalc] = useState<CalculationResult<RegexResult>>(() =>
    testRegex(pattern, flags, text),
  )
  const [showExport, setShowExport] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // Evaluated off the main thread with a hard timeout: a pattern like (a+)+$
  // against pathological input can take exponential time inside a single
  // RegExp.exec() call, which can't be interrupted once it starts running on
  // the main thread -- only a worker can be terminated mid-evaluation.
  useEffect(() => {
    let worker: Worker | null = null
    let timeoutId: number | undefined
    let settled = false

    const debounceId = window.setTimeout(() => {
      worker = new Worker(new URL('../../../lib/calculations/regexWorker.ts', import.meta.url), {
        type: 'module',
      })

      timeoutId = window.setTimeout(() => {
        if (settled) return
        settled = true
        worker?.terminate()
        setCalc({
          ok: false,
          error:
            'This pattern is taking too long to evaluate -- it may be susceptible to catastrophic backtracking. Try simplifying it or shortening the sample text.',
        })
      }, EVAL_TIMEOUT_MS)

      worker.onmessage = (event: MessageEvent<CalculationResult<RegexResult>>) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        setCalc(event.data)
        worker?.terminate()
      }

      worker.postMessage({ pattern, flags, text })
    }, DEBOUNCE_MS)

    return () => {
      settled = true
      window.clearTimeout(debounceId)
      window.clearTimeout(timeoutId)
      worker?.terminate()
    }
  }, [pattern, flags, text])

  return (
    <ToolPageLayout
      category="Utilities"
      title="Regex tester"
      description="Test a regular expression against sample text with live match highlighting."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="regex-pattern" className="text-sm font-medium">
                Pattern
              </label>
              <Input
                id="regex-pattern"
                className="mt-2 font-mono"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="w-24">
              <label htmlFor="regex-flags" className="text-sm font-medium">
                Flags
              </label>
              <Input
                id="regex-flags"
                className="mt-2 font-mono"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
          <div>
            <label htmlFor="regex-text" className="text-sm font-medium">
              Sample text
            </label>
            <textarea
              id="regex-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-fg-muted">
              {calc.result.matches.length} match{calc.result.matches.length === 1 ? '' : 'es'}
            </p>
            <p className="whitespace-pre-wrap break-words rounded-md border border-border bg-bg p-3 text-sm">
              {renderHighlighted(text, calc.result.matches)}
            </p>
            <div>
              <Pill active={showExplanation} onClick={() => setShowExplanation((v) => !v)}>
                {showExplanation ? 'Hide' : 'Show'} plain-English explanation
              </Pill>
              {showExplanation && (
                <ol className="mt-3 flex flex-col gap-1 rounded-md border border-border bg-bg p-3 text-xs">
                  {explainPattern(pattern).map((token, i) => (
                    <li
                      key={i}
                      style={{ paddingLeft: `${token.depth}rem` }}
                      className="flex flex-wrap items-baseline gap-x-2"
                    >
                      <span className="shrink-0 font-mono text-accent">{token.raw}</span>
                      <span className="text-fg-muted">{token.description}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {calc.result.matches.some((match) => match.groups.length > 0) && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-fg-muted">Capture groups</p>
                <div className="flex flex-col gap-2">
                  {calc.result.matches.slice(0, GROUP_BREAKDOWN_LIMIT).map((match, i) => (
                    <div key={i} className="rounded-md border border-border p-2 text-xs">
                      <p className="font-mono">
                        <span className="text-fg-subtle">Match {i + 1}:</span>{' '}
                        <span className="text-accent">{match.match || '(empty match)'}</span>
                      </p>
                      {match.groups.length > 0 && (
                        <ul className="mt-1 flex flex-col gap-0.5 pl-4">
                          {match.groups.map((group, gi) => {
                            const name = calc.result.groupNames[gi]
                            return (
                              <li key={gi} className="font-mono text-fg-muted">
                                Group {gi + 1}
                                {name && <span className="text-accent"> ({name})</span>}:{' '}
                                {group === undefined ? (
                                  <span className="text-fg-subtle italic">did not participate</span>
                                ) : (
                                  <span className="text-fg">{group || '(empty)'}</span>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                {calc.result.matches.length > GROUP_BREAKDOWN_LIMIT && (
                  <p className="text-xs text-fg-subtle">
                    +{calc.result.matches.length - GROUP_BREAKDOWN_LIMIT} more matches not shown
                    here.
                  </p>
                )}
              </div>
            )}
            <div>
              <Pill active={showExport} onClick={() => setShowExport((v) => !v)}>
                {showExport ? 'Hide' : 'Show'} copy as JS / Python / grep (expert)
              </Pill>
              {showExport && (
                <div className="mt-3 flex flex-col gap-2">
                  {buildRegexExports(pattern, flags).map(({ label, code }) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-fg-muted">{label}</span>
                        <CopyButton value={code} label={label} />
                      </div>
                      <pre className="overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                        {code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            The pattern runs against your sample text in a Web Worker with a hard timeout, not
            directly on the page -- some patterns paired with certain input can take exponential
            time to evaluate (catastrophic backtracking), which would otherwise freeze the whole
            tab. Every match found gets highlighted inline, and any capture groups inside a match
            are broken out separately below -- a group written as{' '}
            <code className="font-mono">(?&lt;name&gt;...)</code> shows its name next to its number
            in that breakdown, instead of just a bare index. The plain-English explanation walks the
            pattern itself piece by piece -- each quantifier, character class, and group gets its
            own line, in the order it appears, indented to show what's nested inside what.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to build or debug a pattern against real sample data before dropping it into
            code -- validating an input format, extracting a substring, or confirming a pattern
            matches (or deliberately doesn't match) edge cases you care about.
          </p>
        }
        commonMistakes={
          <p>
            Greedy quantifiers (<code className="font-mono">.*</code>) matching far more than
            intended is the single most common regex surprise -- they consume as much as possible
            before backtracking, which can grab across multiple delimiters you meant to stop at. The
            lazy variant (<code className="font-mono">.*?</code>) stops at the first match instead.
            Forgetting to escape special characters like <code className="font-mono">.</code>,{' '}
            <code className="font-mono">(</code>, or <code className="font-mono">$</code> when you
            mean them literally is another frequent source of patterns that "match too much."
          </p>
        }
        troubleshootingTips={
          <p>
            If evaluation times out, the pattern likely has nested quantifiers over the same
            characters (a classic shape: <code className="font-mono">(a+)+</code>) -- try rewriting
            it to avoid the ambiguity, or shorten the sample text to narrow down which part triggers
            it. If a group shows "did not participate," that group was inside an alternation or
            optional part of the pattern that this particular match didn't take.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

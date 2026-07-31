import { useState, type ReactNode } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { Input } from '../../../components/ui/Input'
import { testRegex, type RegexMatch } from '../../../lib/calculations/regexTester'

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
  const [pattern, setPattern] = useState('\\d+')
  const [flags, setFlags] = useState('g')
  const [text, setText] = useState('Order #123 shipped, invoice #456 pending.')

  const calc = testRegex(pattern, flags, text)

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
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

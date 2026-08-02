import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { asciiCodesToText, textToAscii } from '../../../lib/calculations/asciiConverter'

export function AsciiConverterTool() {
  const [mode, setMode] = useState<'textToCodes' | 'codesToText'>('textToCodes')
  const [text, setText] = useState('Héllo! 👋')
  const [codes, setCodes] = useState('72 101 108 108 111 33')

  const forward = mode === 'textToCodes' ? textToAscii(text) : null
  const backward = mode === 'codesToText' ? asciiCodesToText(codes) : null

  return (
    <ToolPageLayout
      category="Utilities"
      title="ASCII converter"
      description="Convert between text, character codes, and binary -- supports the full Unicode range, not just 7-bit ASCII, so accented letters, symbols, and emoji convert correctly too."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('textToCodes')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'textToCodes' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Text to codes
            </button>
            <button
              type="button"
              onClick={() => setMode('codesToText')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'codesToText' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Codes to text
            </button>
          </div>
          {mode === 'textToCodes' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          ) : (
            <textarea
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              rows={4}
              placeholder="72 101 108 108 111"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
            />
          )}
        </div>
      }
      result={
        mode === 'textToCodes' ? (
          forward!.ok ? (
            <div className="max-h-80 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium text-fg-muted">Char</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Decimal</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Hex</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">Binary</th>
                    <th className="px-3 py-2 font-medium text-fg-muted">UTF-8 bytes</th>
                  </tr>
                </thead>
                <tbody>
                  {forward!.result.map((entry, i) => (
                    <tr key={i} className="border-b border-border font-mono last:border-b-0">
                      <td className="px-3 py-2">{entry.char === ' ' ? '(space)' : entry.char}</td>
                      <td className="px-3 py-2">{entry.code}</td>
                      <td className="px-3 py-2">{entry.hex}</td>
                      <td className="px-3 py-2">{entry.binary}</td>
                      <td className="px-3 py-2">{entry.utf8Bytes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-danger">{forward!.error}</p>
          )
        ) : backward!.ok ? (
          <p className="rounded-md border border-border bg-bg p-3 text-sm">{backward!.result}</p>
        ) : (
          <p className="text-sm text-danger">{backward!.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Every character has a numeric code point behind it -- the original 7-bit ASCII table
            covers just 128 of them (English letters, digits, basic punctuation), while Unicode
            extends the same idea to over a million, covering every script and symbol in common use,
            including emoji. This tool reads and writes full Unicode code points, not just the
            original 128-character ASCII range its name refers to.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to see exactly what numeric value sits behind a character (useful when
            debugging encoding issues, building a protocol that references character codes, or just
            satisfying curiosity about what a symbol actually "is" to a computer), or to reconstruct
            text from a list of codes you're staring at in a log or spec.
          </p>
        }
        commonMistakes={
          <p>
            Assuming one character always equals one byte -- true only within the original 7-bit
            ASCII range. Outside it, a character's UTF-8 byte representation can take 2, 3, or even
            4 bytes for a single code point, so "code point count" and "byte length" are different
            numbers the moment non-ASCII text is involved.
          </p>
        }
        troubleshootingTips={
          <p>
            If codes-to-text produces unexpected characters, double check each number is a valid
            Unicode code point (0 to 1,114,111) and that you're not accidentally mixing in a byte
            value from a different encoding, which won't map to the same character.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

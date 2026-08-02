import { useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { CopyableTextarea } from '../CopyableTextarea'
import { CharDiffView } from '../CharDiffView'
import { Pill } from '../../../components/ui/Pill'
import { base64Decode, base64Encode } from '../../../lib/calculations/base64'
import { shellQuote } from '../../../lib/calculations/shellQuote'

function buildBase64CliSnippet(mode: 'encode' | 'decode', input: string): string {
  return mode === 'encode'
    ? `echo -n ${shellQuote(input)} | base64`
    : `echo ${shellQuote(input)} | base64 -d`
}

export function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('Hello, PacketNova!')
  const [showCli, setShowCli] = useState(false)

  const result =
    mode === 'encode' ? { ok: true as const, result: base64Encode(input) } : base64Decode(input)

  return (
    <ToolPageLayout
      category="Security"
      title="Base64 encode/decode"
      description="Encode or decode Base64 text instantly -- this is encoding, not encryption. Base64 has no key and no secret; anyone can decode it back to the original text just as easily as this tool did, so it's for safely transporting binary-ish data through text-only channels, not for hiding it."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'encode' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'decode' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Decode
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>
      }
      result={
        result.ok ? (
          <div className="flex flex-col gap-4">
            <CopyableTextarea value={result.result} />
            <CharDiffView before={input} after={result.result} />
            <div>
              <Pill active={showCli} onClick={() => setShowCli((v) => !v)}>
                {showCli ? 'Hide' : 'Show'} CLI equivalent (expert)
              </Pill>
              {showCli && (
                <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-3 font-mono text-xs">
                  {buildBase64CliSnippet(mode, input)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Base64 maps every 3 bytes of input to 4 printable ASCII characters, using a 64-symbol
            alphabet (A-Z, a-z, 0-9, plus two more) that's safe to put inside text-based formats
            like JSON, XML, or an email body without anything getting misinterpreted as a control
            character or breaking the surrounding syntax.
          </p>
        }
        whenToUseThis={
          <p>
            Reach for this whenever binary-ish data needs to travel through something that only
            reliably handles text: embedding an image as a data URI, attaching a file to an email,
            or putting binary content inside a JSON field. It's not for hiding data from anyone --
            decoding requires no key, just this exact reverse operation.
          </p>
        }
        commonMistakes={
          <p>
            Assuming Base64 provides any confidentiality -- it doesn't, and treating it as a
            lightweight "encryption" is a real, recurring security mistake. Also worth knowing: JWTs
            and other URL-embedded tokens use a variant called base64url, which swaps two characters
            ("+"/"/" become "-"/"_") and drops padding so the result is safe inside a URL -- pasting
            one of those into a standard Base64 tool won't decode cleanly.
          </p>
        }
        troubleshootingTips={
          <p>
            If decoding fails, check whether the input is actually base64url (JWTs, some
            URL-embedded tokens) rather than standard Base64 -- the character substitutions and
            missing padding are the usual culprit. Trailing whitespace or a line break copied along
            with the text can also break decoding.
          </p>
        }
        relatedReading={
          <p>
            Working with a JWT specifically? The{' '}
            <Link to="/tools/jwt-decoder" className="text-accent hover:underline">
              JWT decoder
            </Link>{' '}
            handles the base64url variant and the token structure directly.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

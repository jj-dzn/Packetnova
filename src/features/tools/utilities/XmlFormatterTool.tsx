import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { CopyableTextarea } from '../CopyableTextarea'
import { formatXml } from '../../../lib/calculations/xmlFormatter'

export function XmlFormatterTool() {
  const [input, setInput] = useState(
    '<config><tool name="subnet">enabled</tool><tool name="cidr">enabled</tool></config>',
  )

  const result = formatXml(input)

  return (
    <ToolPageLayout
      category="Utilities"
      title="XML formatter"
      description="Format and validate XML."
      input={
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          spellCheck={false}
          className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg focus:border-accent focus:outline-none"
        />
      }
      result={
        result.ok ? (
          <CopyableTextarea value={result.result} rows={12} />
        ) : (
          <p className="text-sm text-danger">{result.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            This parses the document as XML and re-serializes it with consistent indentation, one
            element per line, mirroring the actual nesting depth of the document. Parsing also
            doubles as validation -- a document that fails to parse has a real structural problem,
            not just messy formatting.
          </p>
        }
        whenToUseThis={
          <p>
            Use this on XML that's hard to read as delivered: a minified SOAP response, an RSS/Atom
            feed, a legacy config file, or hand-edited markup where indentation has drifted from the
            actual element nesting.
          </p>
        }
        commonMistakes={
          <p>
            An unescaped <code className="font-mono">&</code> in text content is one of the most
            common ways XML breaks -- it must be written as{' '}
            <code className="font-mono">&amp;amp;</code> unless it's starting a recognized entity.
            Mismatched or unclosed tags are the other frequent cause of parse failures; unlike HTML,
            XML parsers don't try to guess what you meant.
          </p>
        }
        troubleshootingTips={
          <p>
            If a document fails to parse, check for an unescaped ampersand first, then scan for a
            tag that was opened but never closed -- both are far more common than a genuinely
            malformed structure.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

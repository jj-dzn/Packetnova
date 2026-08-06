import { useState, type ReactNode } from 'react'
import { DepthToggle, type Depth } from '../../components/ui/DepthToggle'

export interface DepthVariants {
  concise: ReactNode
  detailed: ReactNode
  rfcPrecise: ReactNode
}

type EducationContent = ReactNode | DepthVariants

interface ToolEducationProps {
  howItWorks?: EducationContent
  whenToUseThis?: EducationContent
  commonMistakes?: EducationContent
  troubleshootingTips?: EducationContent
  relatedReading?: EducationContent
}

const SECTIONS: { key: keyof ToolEducationProps; label: string }[] = [
  { key: 'howItWorks', label: 'How it works' },
  { key: 'whenToUseThis', label: 'When to use this' },
  { key: 'commonMistakes', label: 'Common mistakes' },
  { key: 'troubleshootingTips', label: 'Troubleshooting tips' },
  { key: 'relatedReading', label: 'Related reading' },
]

// A plain ReactNode has always been valid (most tools only ever write one
// register); a section only becomes depth-varying by opting into all
// three keys at once, so there's no ambiguous partial state.
function isDepthVariants(content: EducationContent): content is DepthVariants {
  return (
    typeof content === 'object' &&
    content !== null &&
    !Array.isArray(content) &&
    'concise' in content &&
    'detailed' in content &&
    'rfcPrecise' in content
  )
}

function resolveContent(content: EducationContent | undefined, depth: Depth): ReactNode {
  if (content === undefined) return undefined
  if (!isDepthVariants(content)) return content
  if (depth === 'concise') return content.concise
  if (depth === 'rfc-precise') return content.rfcPrecise
  return content.detailed
}

// The standardized educational layer every tool should eventually have --
// collapsible so a page with all five sections filled in doesn't turn into
// a wall of text competing with the calculator above it. Omit any prop
// that doesn't apply to a given tool rather than passing an empty node;
// the section itself won't render. A section can optionally be written in
// three registers (Concise / Detailed / RFC-precise) instead of one --
// the depth toggle only appears at all once a tool has actually written
// more than the default single register for at least one section, so the
// ~29 tools that haven't opted in render exactly as before.
export function ToolEducation(props: ToolEducationProps) {
  const [depth, setDepth] = useState<Depth>('detailed')
  const sections = SECTIONS.filter((section) => props[section.key])
  if (sections.length === 0) return null

  const hasDepthVarying = sections.some((section) => isDepthVariants(props[section.key]!))

  return (
    <div className="mt-10 border-t border-border pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Learn more</h2>
        {hasDepthVarying && <DepthToggle depth={depth} onChange={setDepth} />}
      </div>
      <div className="flex flex-col gap-2">
        {sections.map((section, index) => (
          <details
            key={section.key}
            className="group rounded-md border border-border bg-surface"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {section.label}
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-150 group-open:rotate-180"
                aria-hidden="true"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="px-4 pb-4 text-sm leading-relaxed text-fg-muted">
              {resolveContent(props[section.key], depth)}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

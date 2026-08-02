import type { ReactNode } from 'react'

interface ToolEducationProps {
  howItWorks?: ReactNode
  whenToUseThis?: ReactNode
  commonMistakes?: ReactNode
  troubleshootingTips?: ReactNode
  relatedReading?: ReactNode
}

const SECTIONS: { key: keyof ToolEducationProps; label: string }[] = [
  { key: 'howItWorks', label: 'How it works' },
  { key: 'whenToUseThis', label: 'When to use this' },
  { key: 'commonMistakes', label: 'Common mistakes' },
  { key: 'troubleshootingTips', label: 'Troubleshooting tips' },
  { key: 'relatedReading', label: 'Related reading' },
]

// The standardized educational layer every tool should eventually have --
// collapsible so a page with all five sections filled in doesn't turn into
// a wall of text competing with the calculator above it. Omit any prop
// that doesn't apply to a given tool rather than passing an empty node;
// the section itself won't render.
export function ToolEducation(props: ToolEducationProps) {
  const sections = SECTIONS.filter((section) => props[section.key])
  if (sections.length === 0) return null

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-lg font-semibold">Learn more</h2>
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
              {props[section.key]}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}

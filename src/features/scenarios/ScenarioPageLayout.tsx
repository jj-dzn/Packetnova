import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'
import { StructuredData } from '../../components/seo/StructuredData'
import { useBreadcrumbSchema } from '../../lib/seo/useBreadcrumbSchema'
import { ScenarioEmbedContext } from './ScenarioEmbedContext'

interface ScenarioPageLayoutProps {
  category: string
  title: string
  setup: ReactNode
  resolution: ReactNode
  children: ReactNode
}

// The shell every scenario page shares: a problem statement, then a
// sequence of ScenarioStage sections (each embedding a real, already-shipped
// tool or visualizer -- never a reimplementation), closing on what actually
// fixed it. This is deliberately thin -- the real content is the tools
// themselves and the narration wrapped around them.
export function ScenarioPageLayout({
  category,
  title,
  setup,
  resolution,
  children,
}: ScenarioPageLayoutProps) {
  const breadcrumbSchema = useBreadcrumbSchema('Scenarios', '/scenarios', title)

  return (
    <div className="py-12">
      <StructuredData data={breadcrumbSchema} />
      <div className="mb-10 max-w-2xl">
        <Badge tone="accent">{category}</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <div className="mt-3 flex flex-col gap-3 text-fg-muted">{setup}</div>
      </div>

      <ScenarioEmbedContext.Provider value={true}>
        <div className="flex flex-col gap-12">{children}</div>
      </ScenarioEmbedContext.Provider>

      <div className="mt-12 rounded-lg border border-success/30 bg-success/5 p-6">
        <p className="text-sm font-semibold text-success">What actually fixed it</p>
        <div className="mt-2 flex flex-col gap-2 text-sm text-fg-muted">{resolution}</div>
      </div>
    </div>
  )
}

interface ScenarioStageProps {
  number: number
  title: string
  narration: ReactNode
  children: ReactNode
}

export function ScenarioStage({ number, title, narration, children }: ScenarioStageProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="flex h-6 w-6 shrink-0 translate-y-0.5 items-center justify-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">
          {number}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm text-fg-muted">{narration}</p>
      <div className="rounded-lg border border-border bg-surface/50 p-4 sm:p-6">{children}</div>
    </div>
  )
}

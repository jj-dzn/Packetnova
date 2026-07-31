import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'

interface ToolPageLayoutProps {
  category: string
  title: string
  description: string
  input: ReactNode
  result: ReactNode
}

export function ToolPageLayout({
  category,
  title,
  description,
  input,
  result,
}: ToolPageLayoutProps) {
  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">{category}</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-6">{input}</div>
        <div className="rounded-lg border border-border bg-surface p-6">{result}</div>
      </div>
    </div>
  )
}

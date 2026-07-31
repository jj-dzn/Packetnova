import type { ReactNode } from 'react'
import { Badge } from '../../components/ui/Badge'

interface VisualizerPageLayoutProps {
  category: string
  title: string
  description: string
  children: ReactNode
}

export function VisualizerPageLayout({
  category,
  title,
  description,
  children,
}: VisualizerPageLayoutProps) {
  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">{category}</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">{description}</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">{children}</div>
    </div>
  )
}

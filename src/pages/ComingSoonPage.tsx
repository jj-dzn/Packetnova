import { Badge } from '../components/ui/Badge'

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Badge>Coming soon</Badge>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-md text-fg-muted">
        This section is being built out in a later milestone. Check back soon.
      </p>
    </div>
  )
}

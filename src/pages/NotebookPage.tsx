import { Link } from 'react-router'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useNotebook } from '../hooks/useNotebook'
import { downloadTextFile } from '../lib/download'
import { buildNotebookMarkdown } from '../lib/notebook/buildNotebookMarkdown'

export function NotebookPage() {
  const { entries, remove, clear } = useNotebook()

  return (
    <div className="py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="accent">{entries.length} pinned</Badge>
          <h1 className="mt-4 text-2xl font-semibold">Notebook</h1>
          <p className="mt-2 max-w-xl text-fg-muted">
            Results pinned from tools, visualizers, and scenarios, kept in this browser across a
            whole session -- not tied to any one page. Look for "Pin to notebook" wherever you see a
            result.
          </p>
        </div>
        {entries.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                downloadTextFile(
                  'packetnova-notebook.md',
                  buildNotebookMarkdown(entries),
                  'text/markdown',
                )
              }
            >
              Export as Markdown
            </Button>
            <Button variant="secondary" onClick={clear}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-fg-muted">
          Nothing pinned yet -- look for "Pin to notebook" on a tool, visualizer, or scenario
          result.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge tone="accent">{entry.category}</Badge>
                  <Link to={entry.href} className="mt-2 block font-medium hover:text-accent">
                    {entry.title}
                  </Link>
                  <p className="mt-1 text-xs text-fg-subtle">
                    Pinned {new Date(entry.pinnedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.title} from notebook`}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-fg-subtle transition-colors hover:text-danger"
                >
                  Remove
                </button>
              </div>
              <div className="overflow-x-auto rounded-md border border-border bg-bg px-3">
                {entry.summary.split('\n').map((line, index) => (
                  <div
                    key={index}
                    className="border-b border-border py-1.5 text-sm break-words last:border-b-0"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

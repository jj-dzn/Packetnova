import { SITE_URL } from '../seo/pageMeta'
import type { NotebookEntry } from '../storage/notebook'

// Entries come in newest-first (how they're stored/displayed); exported
// oldest-first so the Markdown reads top-to-bottom the way the entries were
// actually pinned during the session.
export function buildNotebookMarkdown(entries: NotebookEntry[]): string {
  const ordered = [...entries].reverse()
  const lines: string[] = ['# PacketNova notebook', '']

  for (const entry of ordered) {
    lines.push(`## ${entry.title}`)
    lines.push(
      `_${entry.category} -- pinned ${new Date(entry.pinnedAt).toLocaleString()} -- ${SITE_URL}${entry.href}_`,
    )
    lines.push('')
    lines.push('```')
    lines.push(entry.summary)
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

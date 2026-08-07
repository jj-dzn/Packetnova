import { SITE_URL } from '../seo/pageMeta'
import type { NotebookEntry } from '../storage/notebook'

// A code fence's closing marker just needs to be a run of backticks at
// least as long as the opening one (CommonMark) -- so a fence one longer
// than the longest backtick run already inside the content can never be
// closed early by that content, no matter what a pinned result happens to
// contain (it's a snapshot of on-page text, not something this function
// controls the shape of).
function codeFenceFor(content: string): string {
  const runs = content.match(/`+/g) ?? []
  const longestRun = runs.reduce((max, run) => Math.max(max, run.length), 0)
  return '`'.repeat(Math.max(3, longestRun + 1))
}

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
    const fence = codeFenceFor(entry.summary)
    lines.push(fence)
    lines.push(entry.summary)
    lines.push(fence)
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

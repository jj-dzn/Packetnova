import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify)

// Blog post bodies are our own authored markdown checked into the repo, not
// user input, so rendering the resulting HTML directly (no sanitization
// pass) carries no injection risk here.
export function renderMarkdown(markdown: string): string {
  return String(processor.processSync(markdown))
}

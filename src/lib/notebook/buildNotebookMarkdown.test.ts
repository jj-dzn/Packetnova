import { describe, it, expect } from 'vitest'
import { buildNotebookMarkdown } from './buildNotebookMarkdown'
import type { NotebookEntry } from '../storage/notebook'

const ENTRY_A: NotebookEntry = {
  id: 'a',
  href: '/tools/cidr-calculator',
  title: 'CIDR calculator',
  category: 'Utilities',
  summary: '10.0.0.0/24\n256 addresses',
  pinnedAt: Date.parse('2026-01-01T00:00:00Z'),
}

const ENTRY_B: NotebookEntry = {
  id: 'b',
  href: '/scenarios/dns-negative-cache',
  title: 'DNS that works everywhere except one network',
  category: 'DNS',
  summary: 'The office resolver was caching the NXDOMAIN past the SOA MINIMUM.',
  pinnedAt: Date.parse('2026-01-02T00:00:00Z'),
}

describe('buildNotebookMarkdown', () => {
  it('returns just a heading for an empty notebook', () => {
    expect(buildNotebookMarkdown([])).toBe('# PacketNova notebook\n')
  })

  it('renders each entry as a section with title, metadata, and a fenced summary', () => {
    const md = buildNotebookMarkdown([ENTRY_A])
    expect(md).toContain('## CIDR calculator')
    expect(md).toContain('Utilities --')
    expect(md).toContain('https://packetnova.ca/tools/cidr-calculator')
    expect(md).toContain('```\n10.0.0.0/24\n256 addresses\n```')
  })

  it('orders entries oldest-pinned first, even though input is newest-first', () => {
    const md = buildNotebookMarkdown([ENTRY_B, ENTRY_A])
    expect(md.indexOf('CIDR calculator')).toBeLessThan(
      md.indexOf('DNS that works everywhere except one network'),
    )
  })

  it('is valid, non-empty markdown for every entry supplied', () => {
    const md = buildNotebookMarkdown([ENTRY_A, ENTRY_B])
    expect(md.startsWith('# PacketNova notebook')).toBe(true)
    expect(md.trim().length).toBeGreaterThan(0)
  })

  it('widens the fence so a summary containing a code block of its own cannot break out early', () => {
    const entryWithFence: NotebookEntry = {
      ...ENTRY_A,
      summary: 'Result:\n```\nnot actually the end\n```\nmore text after',
    }
    const md = buildNotebookMarkdown([entryWithFence])
    // The fence must be longer than the longest backtick run already in
    // the content -- otherwise the embedded ``` would close the block
    // early and "more text after" would spill out as loose Markdown
    // instead of staying inside the fenced summary.
    expect(md).toContain('````\nResult:\n```\nnot actually the end\n```\nmore text after\n````')
  })
})

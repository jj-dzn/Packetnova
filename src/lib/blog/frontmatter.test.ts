import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './frontmatter'

describe('parseFrontmatter', () => {
  it('parses string, date, and array fields', () => {
    const raw = `---
title: "Understanding MTU"
description: "Why packet size limits matter."
date: "2026-07-20"
tags: ["mtu", "fragmentation"]
---

The body starts here.`
    const { data, content } = parseFrontmatter(raw)
    expect(data).toEqual({
      title: 'Understanding MTU',
      description: 'Why packet size limits matter.',
      date: '2026-07-20',
      tags: ['mtu', 'fragmentation'],
    })
    expect(content).toBe('The body starts here.')
  })

  it('trims leading/trailing whitespace from the body', () => {
    const raw = '---\ntitle: "X"\n---\n\n\nBody text\n\n'
    const { content } = parseFrontmatter(raw)
    expect(content).toBe('Body text')
  })

  it('handles a body containing its own "---" horizontal rules', () => {
    const raw = '---\ntitle: "X"\n---\nFirst part\n\n---\n\nSecond part'
    const { data, content } = parseFrontmatter(raw)
    expect(data.title).toBe('X')
    expect(content).toBe('First part\n\n---\n\nSecond part')
  })

  it('falls back to raw text for a non-JSON value', () => {
    const raw = '---\ntitle: Unquoted Title\n---\nBody'
    const { data } = parseFrontmatter(raw)
    expect(data.title).toBe('Unquoted Title')
  })

  it('returns empty data and the raw text unchanged when there is no frontmatter block', () => {
    const raw = 'Just a plain markdown file, no frontmatter.'
    const { data, content } = parseFrontmatter(raw)
    expect(data).toEqual({})
    expect(content).toBe(raw)
  })

  it('ignores blank lines within the frontmatter block', () => {
    const raw = '---\ntitle: "X"\n\ndescription: "Y"\n---\nBody'
    const { data } = parseFrontmatter(raw)
    expect(data).toEqual({ title: 'X', description: 'Y' })
  })

  it("parses single-quoted strings and arrays -- Prettier reformats this project's frontmatter to single quotes on every save", () => {
    const raw = "---\ntitle: 'Understanding MTU'\ntags: ['mtu', 'fragmentation']\n---\nBody"
    const { data } = parseFrontmatter(raw)
    expect(data).toEqual({ title: 'Understanding MTU', tags: ['mtu', 'fragmentation'] })
  })
})

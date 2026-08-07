/** Safely embeds an arbitrary string as a Python string literal. Prefers a
 * raw string (r"...") using whichever quote character doesn't appear in
 * the value, since that's what a regex pattern should look like in Python
 * source -- but a raw string can't represent every value (one containing
 * both quote characters, or one ending in an odd number of backslashes,
 * which would escape the closing quote instead of terminating the
 * string), so those fall back to a fully escaped normal string literal,
 * which can represent any value correctly regardless of its own quoting
 * or backslash content. */
export function pythonStringLiteral(value: string): string {
  const trailingBackslashes = /\\*$/.exec(value)![0].length
  const endsSafeForRawString = trailingBackslashes % 2 === 0

  if (endsSafeForRawString) {
    if (!value.includes('"')) return `r"${value}"`
    if (!value.includes("'")) return `r'${value}'`
  }

  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `"${escaped}"`
}

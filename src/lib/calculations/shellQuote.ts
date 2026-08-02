/** POSIX single-quote escaping for embedding arbitrary text as one shell
 * argument in a generated CLI snippet -- a literal `'` can't appear inside
 * a single-quoted string, so it's closed, an escaped quote is inserted,
 * and the quoting reopens: `it's` becomes `'it'\''s'`. */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

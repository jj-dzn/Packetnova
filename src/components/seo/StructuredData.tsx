// React 19 hoists <title>/<meta>/<script> rendered anywhere in the tree up
// into <head> automatically (including de-duplication), so this can be
// dropped directly into whichever page component needs it -- no portal or
// manual DOM manipulation required.
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>
}

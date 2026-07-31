import { useState, type ReactNode } from 'react'
import { Input } from './Input'

interface DataTableColumn<T> {
  key: keyof T
  label: string
  mono?: boolean
  /** Custom cell rendering -- falls back to the raw column value. */
  render?: (row: T) => ReactNode
  /** React key override -- needed when two columns derive from the same underlying field. */
  id?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  searchPlaceholder?: string
}

export function DataTable<T>({
  columns,
  rows,
  searchPlaceholder = 'Search this table...',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredRows = normalizedQuery
    ? rows.filter((row) =>
        columns.some((column) =>
          String(row[column.key] ?? '')
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      )
    : rows

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
      />
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th
                  key={column.id ?? String(column.key)}
                  className="px-3 py-2 font-medium text-fg-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-fg-muted">
                  No matches for &quot;{query}&quot;
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr key={index} className="border-b border-border last:border-b-0">
                  {columns.map((column) => (
                    <td
                      key={column.id ?? String(column.key)}
                      className={`px-3 py-2 ${column.mono ? 'font-mono' : ''}`}
                    >
                      {column.render ? column.render(row) : (row[column.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

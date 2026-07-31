import type { ReactNode } from 'react'

interface DataTableColumn<T> {
  key: keyof T
  label: string
  mono?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
}

export function DataTable<T>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface">
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th key={String(column.key)} className="px-3 py-2 font-medium text-fg-muted">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-b-0">
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={`px-3 py-2 ${column.mono ? 'font-mono' : ''}`}
                >
                  {row[column.key] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

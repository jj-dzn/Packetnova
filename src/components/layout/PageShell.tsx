import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

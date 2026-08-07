import { Component, type ReactNode } from 'react'

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  error: Error | null
}

// A last-resort catch for a bug in some page's own render logic -- without
// this, an uncaught render error takes down the entire app (including Nav,
// so there's no way to even navigate away) instead of just the one broken
// page. Lives inside PageShell's pathname-keyed remount boundary, so
// navigating to any other page clears the error automatically.
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Route crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-lg font-semibold">Something broke on this page.</p>
          <p className="max-w-md text-sm text-fg-muted">
            {this.state.error.message || 'An unexpected error occurred.'} Try a different input, or
            head back and try again.
          </p>
          <a href="/" className="text-sm font-medium text-accent hover:underline">
            Back to home
          </a>
        </div>
      )
    }
    return this.props.children
  }
}

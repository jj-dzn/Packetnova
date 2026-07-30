import { Button } from '../../components/ui/Button'

export function Newsletter() {
  return (
    <section className="py-16">
      <div className="rounded-lg border border-border bg-surface p-8 text-center">
        <h2 className="text-xl font-semibold">Stay in the loop</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-fg-muted">
          Get notified when new tools and visualizers ship.
        </p>
        <form
          className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="email"
            placeholder="you@example.com"
            disabled
            className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-subtle disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button type="submit" disabled>
            Notify me
          </Button>
        </form>
        <p className="mt-3 text-xs text-fg-subtle">Coming soon</p>
      </div>
    </section>
  )
}

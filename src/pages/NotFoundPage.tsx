import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Mascot } from '../components/ui/Mascot'

// "slow" rather than "error" -- a 404 isn't the mascot's fault, it's more
// "hmm, nothing here" than "something's broken." Same reasoning as picking
// a mood for any other new placement: closest existing feeling, not a new
// visual state.
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Mascot mood="slow" className="h-20 w-20" label="PacketNova, looking a little lost" />
      <p className="font-mono text-sm text-fg-subtle">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-fg-muted">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}

import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Mascot } from '../components/ui/Mascot'

// The one page built for reading rather than doing -- no calculator, no
// ToolPageLayout grid. The mascot appears here as a quiet background
// presence (low-opacity, aria-hidden, tucked in a corner) rather than the
// prominent centered role it plays on NotFoundPage -- same character, a
// different kind of appearance, per E9's "background cameo" framing.
export function AboutPage() {
  return (
    <div className="relative py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-4 opacity-[0.12] sm:right-6"
      >
        <Mascot mood="idle" className="h-24 w-24" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">About</p>
        <h1 className="mt-2 text-2xl font-semibold">Why "nova"</h1>

        <div className="mt-6 flex flex-col gap-4 text-fg-muted">
          <p>
            A nova is a star suddenly burning bright enough to become visible against a sky that, a
            moment earlier, looked empty. That's the whole visual language here -- a dark
            background, faint stars, an occasional signal streaking across it -- because that's
            also, almost exactly, what a network looks like once you stop thinking of it as cables
            and start thinking of it as light. Packets are just signal, traveling through darkness,
            briefly visible at the exact moment they matter.
          </p>
          <p>
            It's also the feeling this site is actually built around: the moment something that
            looked opaque a minute ago -- why a route lost a tiebreak, why a subnet mask lands where
            it does, why BGP picked the "wrong" path -- suddenly, fully clicks. That's a nova too,
            just a smaller one, and it's the reason every visualizer here steps through the
            reasoning instead of just handing back an answer.
          </p>

          <h2 className="mt-4 text-lg font-semibold text-fg">What this actually is</h2>
          <p>
            A free, client-side networking toolkit -- calculators, protocol explorers, and
            interactive visualizers that run entirely in your browser. No account. No backend. No
            telemetry watching what you calculate. Every result comes from a tested, pure function
            running on your machine, not a request going anywhere.
          </p>
          <p>
            It's built by someone who actually uses this stuff -- subnetting by hand, tracing why a
            BGP path took the route it did, explaining STP to someone for the fifth time -- and got
            tired of every existing tool being either a bare calculator with no explanation, or an
            explainer article with no calculator. This is meant to be both at once.
          </p>

          <h2 className="mt-4 text-lg font-semibold text-fg">Poke around</h2>
          <p>
            There's more on this site than the nav bar shows. A few things aren't linked from
            anywhere at all -- if you find one, you found it the right way.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link to="/tools">
              <Button variant="secondary">Browse tools</Button>
            </Link>
            <Link to="/scenarios">
              <Button variant="secondary">Try a scenario</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

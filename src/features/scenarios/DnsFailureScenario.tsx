import { BranchingScenario, type BranchingScenarioNode } from './BranchingScenario'
import { DnsRecordReference } from '../tools/protocols/DnsRecordReference'

const NODES: Record<string, BranchingScenarioNode> = {
  start: {
    id: 'start',
    title: 'Works from home, times out from the office',
    narration: (
      <>
        <p>
          A new subdomain, <code>app.company.com</code>, went live yesterday. It resolves and loads
          fine from home, from a phone on cellular, from everywhere the team has tried -- except the
          office network, where it just times out in the browser.
        </p>
        <p>What's the first thing to check?</p>
      </>
    ),
    choices: [
      {
        label: "Check whether the office's own DNS resolver can actually resolve this record",
        to: 'check-resolution',
      },
      {
        label: 'Assume a firewall or proxy on the office network is blocking the new app',
        to: 'wrong-firewall',
      },
    ],
  },
  'wrong-firewall': {
    id: 'wrong-firewall',
    title: 'It never gets far enough to hit a firewall',
    outcome: 'wrong-turn',
    narration: (
      <p>
        Pinging the hostname from an office machine hangs at "could not resolve host" -- it never
        even produces an IP address to send a packet to, let alone one a firewall could block.
        Curling the app's IP address directly, bypassing DNS entirely, works instantly from the same
        machine. Whatever's wrong is happening before name resolution finishes, not after.
      </p>
    ),
  },
  'check-resolution': {
    id: 'check-resolution',
    title: 'Walk the resolution path the office resolver actually takes',
    narration: (
      <>
        <p>
          Every DNS answer -- including "this doesn't exist" -- gets cached for a while so resolvers
          don't have to ask again for every request. How long depends on the record type and the
          zone's own settings.
        </p>
        <p>
          Querying the app's authoritative server directly, bypassing the office's resolver, returns
          the correct A record immediately. Querying the office's own resolver for the same name
          times out with no answer at all.
        </p>
      </>
    ),
    content: <DnsRecordReference />,
    choices: [
      {
        label:
          "The office resolver cached a negative answer before the record existed, and hasn't asked again since",
        to: 'resolution',
      },
      { label: "The new server's A record must be typed wrong", to: 'wrong-record' },
    ],
  },
  'wrong-record': {
    id: 'wrong-record',
    title: 'The record itself is correct',
    outcome: 'wrong-turn',
    narration: (
      <p>
        Querying the authoritative server directly already ruled this out -- it returns the right A
        record instantly, from the actual source of truth for this zone. If the record were wrong,
        every resolver everywhere would get the same wrong answer, not just this one office network.
      </p>
    ),
  },
  resolution: {
    id: 'resolution',
    title: 'A negative answer, cached before the record existed',
    outcome: 'resolution',
    narration: (
      <p>
        The subdomain didn't exist yet the first time someone on the office network tried to reach
        it -- maybe a stray request while it was being set up. The office resolver got back an
        authoritative "no such name," and cached that negative answer, exactly like it would cache a
        positive one. Per RFC 2308, a negative answer's lifetime is governed by the zone's SOA{' '}
        <code className="mx-1 rounded bg-bg px-1 py-0.5 font-mono text-xs">MINIMUM</code> field --
        until that expires, the resolver won't ask again, and every request from that network fails
        the exact same way, even though the record has been correct for a day. Flushing the office
        resolver's cache clears it immediately; the real fix for next time is lowering a zone's SOA
        minimum before a migration, specifically to shrink this exact window.
      </p>
    ),
  },
}

export function DnsFailureScenario() {
  return (
    <BranchingScenario
      category="DNS"
      title="DNS that works everywhere except one network"
      setup={
        <p>
          A branching walk through one of DNS's genuinely non-obvious failure modes -- a negative
          answer, cached before a record existed, standing in the way long after the record itself
          is fine.
        </p>
      }
      nodes={NODES}
      rootId="start"
    />
  )
}

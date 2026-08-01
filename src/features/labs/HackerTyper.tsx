import { useEffect, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'

const CODE_FRAGMENTS = [
  'const socket = net.createConnection(port, host)',
  "socket.on('data', (chunk) => buffer.push(chunk))",
  'if (packet.checksum !== computeChecksum(packet)) throw new Error("corrupt segment")',
  'await tunnel.negotiate(peer.publicKey)',
  'route.metric = Math.min(route.metric, candidate.metric)',
  'firewall.rules.push({ action: "DENY", proto: "tcp", port: 4444 })',
  'SELECT * FROM sessions WHERE expires_at < NOW()',
  'const hop = traceroute.hops[traceroute.hops.length - 1]',
  'ssh -i ./keys/id_rsa root@10.0.0.{1..254}',
  'nmap -sS -p- --open 192.168.0.0/24',
  'export default function decryptPayload(buffer, key) {',
  '  return xor(buffer, deriveKey(key))',
  '}',
  'while (retries < MAX_RETRIES) { await backoff(retries++) }',
  'iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
  'const jwt = header + "." + payload + "." + signature',
  'if (!isAuthorized(session)) return res.status(403).end()',
  'packet.ttl -= 1',
  'if (packet.ttl <= 0) drop(packet, "TTL expired")',
  'bgp.advertise(prefix, { asPath: [65001, 65002] })',
  'const entropy = crypto.randomBytes(32)',
  'cache.set(key, value, { ttl: 300 })',
  'spawn("tcpdump", ["-i", "eth0", "-w", "capture.pcap"])',
  'const latency = performance.now() - request.startedAt',
  'ARP: who-has 10.0.0.1 tell 10.0.0.42',
  'DHCPDISCOVER received on eth0',
  'git commit -m "definitely not a backdoor"',
  'sudo systemctl restart networking',
  '// TODO: figure out why this actually works',
  'process.env.MAINFRAME_ACCESS = "granted"',
]

const MAX_LINES = 300

export function HackerTyper() {
  const [lines, setLines] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  function addLine() {
    setLines((current) => {
      const next = [...current, CODE_FRAGMENTS[Math.floor(Math.random() * CODE_FRAGMENTS.length)]!]
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next
    })
  }

  // Desktop: any physical keydown, anywhere on the page. Mobile has no
  // physical keyboard to listen for, so it needs an actual focused text
  // input to summon the on-screen one -- see the input rendered below the
  // terminal.
  useEffect(() => {
    function handleKeyDown() {
      addLine()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight })
  }, [lines])

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Hacker typer</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Mash any key. Look like you know exactly what you're doing.
        </p>
      </div>

      <div
        ref={containerRef}
        className="h-[420px] overflow-y-auto rounded-lg border border-border bg-black p-4 font-mono text-xs text-green-400"
      >
        {lines.length === 0 ? (
          <p className="text-fg-subtle">Start typing anywhere on this page...</p>
        ) : (
          lines.map((line, index) => (
            <p key={index} className="whitespace-pre">
              {line}
            </p>
          ))
        )}
      </div>

      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="No keyboard? Tap here and type on mobile"
        onKeyDown={(event) => event.stopPropagation()}
        onChange={(event) => {
          event.target.value = ''
          addLine()
        }}
        className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
      />
    </div>
  )
}

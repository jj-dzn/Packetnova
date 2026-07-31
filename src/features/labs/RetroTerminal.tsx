import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

const BANNER = `╔══════════════════════════════════╗
║        P A C K E T N O V A        ║
║  -- networking tools terminal --  ║
╚══════════════════════════════════╝`

const BOOT_LINES = [
  '[  OK  ] Initializing nova core...',
  '[  OK  ] Establishing subspace uplink...',
  '[  OK  ] Loading packet manifest...',
  '[  OK  ] Calibrating starfield...',
  '[  OK  ] Mounting /tools /visualizers /blog...',
  '',
  'Welcome to PacketNova OS v1.0.',
  "Type 'help' to see what this thing does.",
]

const PROMPT = 'guest@packetnova:~$'

const HELP_TEXT = [
  'Available commands:',
  '  help         show this list',
  '  whoami       who are you, really',
  '  ls           list the site',
  '  about        what is PacketNova',
  '  ping <host>  pretend to ping a host',
  '  date         current date/time',
  '  clear        clear the screen',
  '  exit         leave the terminal',
]

interface Line {
  id: number
  text: string
  variant: 'input' | 'output'
}

let lineId = 0
function nextId() {
  lineId += 1
  return lineId
}

function runCommand(raw: string): string[] {
  const trimmed = raw.trim()
  const [cmd, ...args] = trimmed.split(/\s+/)
  const lower = (cmd ?? '').toLowerCase()

  switch (lower) {
    case '':
      return []
    case 'help':
      return HELP_TEXT
    case 'whoami':
      return ['guest (probably a networking nerd)']
    case 'ls':
      return ['tools/  visualizers/  blog/  labs/  coffee.exe']
    case 'about':
    case 'nova':
      return [
        'PacketNova -- free, client-side networking toolkit.',
        'Calculators, protocol explorers, and interactive visualizers.',
        'No account, no server, no tracking.',
      ]
    case 'date':
      return [new Date().toString()]
    case 'sudo':
      return ['Nice try. This incident will not be reported.']
    case 'coffee.exe':
    case './coffee.exe':
      return [
        'Brewing...',
        '[##########] 100%',
        'ERROR: no coffee maker detected on this machine.',
        '(this terminal runs on vibes and JavaScript, not caffeine)',
      ]
    case 'ping': {
      const host = args[0] ?? 'packetnova.ca'
      return [
        `Pinging ${host} with 32 bytes of make-believe data:`,
        `Reply from ${host}: time=${(8 + Math.random() * 20).toFixed(0)}ms`,
        `Reply from ${host}: time=${(8 + Math.random() * 20).toFixed(0)}ms`,
        `Reply from ${host}: time=${(8 + Math.random() * 20).toFixed(0)}ms`,
        '(not a real ping -- try the actual tools for that)',
      ]
    }
    default:
      return [`command not found: ${lower} -- type 'help' for a list`]
  }
}

export function RetroTerminal() {
  const navigate = useNavigate()
  const [bootedLineCount, setBootedLineCount] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? BOOT_LINES.length : 0,
  )
  const bootDone = bootedLineCount >= BOOT_LINES.length
  const [lines, setLines] = useState<Line[]>([])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bootDone) return
    const timer = window.setTimeout(() => setBootedLineCount((count) => count + 1), 220)
    return () => window.clearTimeout(timer)
  }, [bootedLineCount, bootDone])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines, bootedLineCount])

  useEffect(() => {
    if (bootDone) inputRef.current?.focus()
  }, [bootDone])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const command = input
    setInput('')

    const normalized = command.trim().toLowerCase()
    if (normalized === 'clear') {
      setLines([])
      return
    }
    if (normalized === 'exit') {
      navigate('/')
      return
    }

    const output = runCommand(command)
    setLines((current) => [
      ...current,
      { id: nextId(), text: `${PROMPT} ${command}`, variant: 'input' },
      ...output.map((text) => ({ id: nextId(), text, variant: 'output' as const })),
    ])
  }

  return (
    <div
      className="min-h-screen bg-black px-4 py-8 font-mono text-sm text-green-400 sm:px-8"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="mx-auto max-h-screen max-w-3xl overflow-y-auto">
        <pre className="whitespace-pre text-green-400">{BANNER}</pre>

        <div className="mt-4 flex flex-col gap-0.5 whitespace-pre">
          {BOOT_LINES.slice(0, bootedLineCount).map((line, index) => (
            <p key={index} className={line ? undefined : 'h-2'}>
              {line}
            </p>
          ))}
        </div>

        {bootDone && (
          <div className="mt-2 flex flex-col gap-0.5 whitespace-pre">
            {lines.map((line) => (
              <p key={line.id} className={line.variant === 'input' ? 'text-green-200' : undefined}>
                {line.text}
              </p>
            ))}

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label htmlFor="terminal-input" className="text-green-200">
                {PROMPT}
              </label>
              <input
                id="terminal-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="flex-1 bg-transparent text-green-400 outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <span aria-hidden="true" className="motion-safe:animate-pulse">
                _
              </span>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

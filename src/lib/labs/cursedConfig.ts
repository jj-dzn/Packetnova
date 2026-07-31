const INTERFACES = [
  'GigabitEthernet0/0/1',
  'FastEthernet4/2',
  'Vlan666',
  'Loopback99',
  'Tunnel0',
  'Serial0/1/0:23.tribute',
]

const DESCRIPTIONS = ['prod (maybe)', 'definitely not prod', 'the good one', 'legacy -- fear it']

const ABSURD_OPTIONS = [
  'no ip domain-lookup-but-still-lookup',
  'spanning-tree vibes good',
  'ip route 0.0.0.0 0.0.0.0 vibes',
  'description DO NOT TOUCH (since 2019)',
  'shutdown  ! just kidding',
  'access-list 1 permit everyone, honestly',
  'ntp server time.wizard.local',
  'logging host /dev/null',
  'banner motd ^C you are now entering a legally distinct network ^C',
  'ip helper-address 127.0.0.1 ! ask a friend',
]

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]!
}

function randomOctet(): number {
  return Math.floor(Math.random() * 256)
}

function randomIp(): string {
  return `${randomOctet()}.${randomOctet()}.${randomOctet()}.${randomOctet()}`
}

function shuffled<T>(pool: T[]): T[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function generateCursedConfig(): string {
  const lines = [
    `interface ${pick(INTERFACES)}`,
    ` description ${pick(DESCRIPTIONS)}`,
    ` ip address ${randomIp()} 255.255.255.0`,
    ...shuffled(ABSURD_OPTIONS)
      .slice(0, 4)
      .map((option) => ` ${option}`),
    'end',
  ]
  return lines.join('\n')
}

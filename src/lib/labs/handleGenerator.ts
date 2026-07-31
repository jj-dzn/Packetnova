const PREFIXES = [
  'Neon',
  'Ghost',
  'Chrome',
  'Null',
  'Static',
  'Vapor',
  'Glitch',
  'Obsidian',
  'Radiant',
  'Fracture',
  'Synth',
  'Nova',
]

const CORES = [
  'Wolf',
  'Byte',
  'Circuit',
  'Shade',
  'Vector',
  'Echo',
  'Cipher',
  'Raven',
  'Pulse',
  'Drift',
  'Specter',
  'Axiom',
]

const SUFFIXES = ['_root', '.exe', '-9', 'X', '_prime', '//zero', '_v2', '.sys', '-451', '_ghost']

export const CLEARANCE_LEVELS = [
  'Script Kiddie',
  'Junior Operative',
  'Grey Hat',
  'Node Runner',
  'Systems Ghost',
  'Root Access',
  'Shadow Admin',
  'Mainframe Legend',
]

export interface HackerHandle {
  handle: string
  clearance: string
}

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]!
}

export function generateHandle(): HackerHandle {
  return {
    handle: `${pick(PREFIXES)}${pick(CORES)}${pick(SUFFIXES)}`,
    clearance: pick(CLEARANCE_LEVELS),
  }
}

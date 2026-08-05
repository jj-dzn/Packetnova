export type BranchOutcome = 'wrong-turn' | 'resolution'

interface OutcomeLookup {
  [nodeId: string]: { outcome?: BranchOutcome }
}

// A node can appear more than once in the path if a wrong turn was tried,
// backed out of, and hit again -- every visit counts, since each one was a
// genuine (if repeated) wrong guess, not a single toggle-able flag.
export function countWrongTurns(path: string[], nodes: OutcomeLookup): number {
  return path.filter((id) => nodes[id]?.outcome === 'wrong-turn').length
}

export interface ChallengeGrade {
  label: string
  tone: 'success' | 'accent' | 'warning'
}

// Wrong-turn count, not elapsed time, drives the grade -- reading speed and
// tool familiarity swing time wildly for reasons that have nothing to do
// with diagnostic accuracy, while a wrong turn is an unambiguous signal
// the wrong hypothesis was tried first.
export function gradeForWrongTurns(wrongTurns: number): ChallengeGrade {
  if (wrongTurns === 0) return { label: 'Clean diagnosis', tone: 'success' }
  if (wrongTurns === 1) return { label: 'Solid work', tone: 'accent' }
  return { label: 'Got there', tone: 'warning' }
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

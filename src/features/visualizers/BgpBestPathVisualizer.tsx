import {
  EliminationVisualizer,
  type Candidate,
  type EliminationStep,
} from './EliminationVisualizer'

const NETWORK = '172.16.0.0/16'

const CANDIDATES: Candidate[] = [
  {
    id: 'path-a',
    label: 'Path A via Router1',
    detail: 'Weight 100, LocalPref 100, AS-Path [65001,65002,65003]',
  },
  {
    id: 'path-b',
    label: 'Path B via Router2',
    detail: 'Weight 100, LocalPref 200, AS-Path [65001,65002]',
  },
  {
    id: 'path-c',
    label: 'Path C via Router3',
    detail: 'Weight 50, LocalPref 150, AS-Path [65001]',
  },
]

const ALL_IDS = CANDIDATES.map((c) => c.id)

const STEPS: EliminationStep[] = [
  {
    title: 'Ready to select',
    description: `BGP has learned three paths to reach ${NETWORK}. It must pick exactly one to install.`,
    remainingIds: ALL_IDS,
  },
  {
    title: '1. Highest weight wins',
    description:
      'Weight is checked first (Cisco-proprietary, locally significant only). Paths A and B tie at 100 -- Path C (weight 50) is eliminated.',
    remainingIds: ['path-a', 'path-b'],
  },
  {
    title: '2. Highest local preference wins',
    description:
      'With weight tied, local preference decides next. Path B (200) beats Path A (100) -- Path A is eliminated.',
    remainingIds: ['path-b'],
  },
]

export function BgpBestPathVisualizer() {
  return (
    <EliminationVisualizer
      category="Visualizer"
      title="BGP best path selection"
      description="Walk through BGP's path-selection algorithm step by step, attribute by attribute."
      candidates={CANDIDATES}
      steps={STEPS}
      related={[{ to: '/journey/bgp-path', label: 'Inside a BGP path decision (deep dive)' }]}
    />
  )
}

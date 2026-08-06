import { Pill } from './Pill'

export type Depth = 'concise' | 'detailed' | 'rfc-precise'

const DEPTH_LABELS: Record<Depth, string> = {
  concise: 'Concise',
  detailed: 'Detailed',
  'rfc-precise': 'RFC-precise',
}

interface DepthToggleProps {
  depth: Depth
  onChange: (depth: Depth) => void
}

// Same underlying explanation, three registers -- lets one education
// block serve a newcomer skimming for the gist and an engineer who wants
// exact RFC wording, without maintaining two separate pages. Only shown
// by ToolEducation when a tool has actually written more than one
// register for at least one section; caller owns spacing.
export function DepthToggle({ depth, onChange }: DepthToggleProps) {
  return (
    <div className="flex gap-2">
      {(Object.keys(DEPTH_LABELS) as Depth[]).map((option) => (
        <Pill key={option} active={depth === option} onClick={() => onChange(option)}>
          {DEPTH_LABELS[option]}
        </Pill>
      ))}
    </div>
  )
}

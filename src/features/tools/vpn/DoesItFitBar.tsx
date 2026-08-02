interface DoesItFitBarProps {
  effectiveMtu: number
  payload: number
}

// The effective MTU boundary marked on a track, with the payload filled in
// up to wherever it actually reaches -- accent while it's still inside the
// boundary, spilling into a red overflow segment past it when it isn't.
// Scaled to whichever of the two is larger, with a little headroom, so an
// oversized payload's overflow is visibly proportional rather than just an
// arbitrary "it's too big" flag.
export function DoesItFitBar({ effectiveMtu, payload }: DoesItFitBarProps) {
  const fits = payload <= effectiveMtu
  const scaleMax = Math.max(effectiveMtu, payload) * 1.05
  const boundaryPercent = (effectiveMtu / scaleMax) * 100
  const fitPercent = (Math.min(payload, effectiveMtu) / scaleMax) * 100
  const overflowPercent = fits ? 0 : ((payload - effectiveMtu) / scaleMax) * 100

  return (
    <div>
      <div className="relative h-6 overflow-hidden rounded-md bg-bg">
        <div
          className={`absolute inset-y-0 left-0 ${fits ? 'bg-success/60' : 'bg-accent/60'}`}
          style={{ width: `${fitPercent}%` }}
        />
        {!fits && (
          <div
            className="absolute inset-y-0 bg-danger"
            style={{ left: `${fitPercent}%`, width: `${overflowPercent}%` }}
          />
        )}
        <div
          className="absolute inset-y-0 w-0.5 bg-fg"
          style={{ left: `${boundaryPercent}%` }}
          title={`Effective MTU boundary: ${effectiveMtu.toLocaleString()} bytes`}
        />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-fg-subtle">
        <span>0</span>
        <span>
          Payload {payload.toLocaleString()} B {fits ? '<=' : '>'} effective MTU{' '}
          {effectiveMtu.toLocaleString()} B
        </span>
        <span>{Math.round(scaleMax).toLocaleString()}</span>
      </div>
    </div>
  )
}

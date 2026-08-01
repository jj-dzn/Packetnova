export type PadDirection = 'up' | 'down' | 'left' | 'right'

interface DirectionPadProps {
  onPress: (direction: PadDirection) => void
  disabled?: boolean
}

const ARROWS: Record<PadDirection, string> = { up: '↑', down: '↓', left: '←', right: '→' }

// On-screen touch controls, shared by Packet snake and 404 maze -- both are
// otherwise entirely keyboard-driven (arrow keys / WASD), which makes them
// completely unplayable on a phone or tablet with no physical keyboard
// attached. Shown unconditionally rather than behind a touch-device check:
// keyboard users on desktop just won't need it, and reliably detecting
// "has a keyboard" isn't worth the complexity it'd add.
export function DirectionPad({ onPress, disabled = false }: DirectionPadProps) {
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 gap-1.5"
      style={{ width: '9.75rem' }}
      aria-label="Directional controls"
    >
      <div />
      <PadButton direction="up" onPress={onPress} disabled={disabled} />
      <div />
      <PadButton direction="left" onPress={onPress} disabled={disabled} />
      <div />
      <PadButton direction="right" onPress={onPress} disabled={disabled} />
      <div />
      <PadButton direction="down" onPress={onPress} disabled={disabled} />
      <div />
    </div>
  )
}

function PadButton({
  direction,
  onPress,
  disabled,
}: {
  direction: PadDirection
  onPress: (direction: PadDirection) => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(direction)}
      disabled={disabled}
      aria-label={`Move ${direction}`}
      className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-md border border-border bg-surface text-lg text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 disabled:pointer-events-none disabled:opacity-50"
    >
      {ARROWS[direction]}
    </button>
  )
}

import { useEffect, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { encodeForStage, ENCODING_STAGES, STAGE_LABELS } from '../../lib/labs/signalDecoder'

const STAGE_DURATION_MS = 2200

export function SignalDecoder() {
  const [text, setText] = useState('PACKETNOVA')
  const [stageIndex, setStageIndex] = useState(0)
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (reducedMotion) return
    const id = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % ENCODING_STAGES.length)
    }, STAGE_DURATION_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion])

  const trimmed = text.trim() || 'PACKETNOVA'
  const stage = ENCODING_STAGES[stageIndex]!

  return (
    <div className="py-12">
      <div className="mb-8">
        <Badge tone="accent">Fun Labs</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Signal decoder</h1>
        <p className="mt-2 max-w-2xl text-fg-muted">
          Watch any text ripple through Morse, binary, hex, and Base64, and back again. Pure
          animation, not a real encode/decode tool -- there's already one of those elsewhere on the
          site.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-6 py-10 text-center">
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type something..."
          spellCheck={false}
          className="max-w-md"
        />

        {reducedMotion ? (
          <div className="flex w-full max-w-lg flex-col gap-3 text-left">
            {ENCODING_STAGES.map((s) => (
              <div key={s}>
                <p className="text-xs font-medium text-fg-subtle">{STAGE_LABELS[s]}</p>
                <p className="break-all font-mono text-sm">{encodeForStage(trimmed, s)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div key={stage} className="w-full max-w-lg motion-safe:animate-pn-fade-in">
            <Badge tone="accent">{STAGE_LABELS[stage]}</Badge>
            <p className="mt-3 break-all font-mono text-lg">{encodeForStage(trimmed, stage)}</p>
          </div>
        )}
      </Card>
    </div>
  )
}

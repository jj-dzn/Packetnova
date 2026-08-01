import type { ReactNode } from 'react'
import { Mascot, type MascotMood } from '../../components/ui/Mascot'

interface JourneyGuideProps {
  mood: MascotMood
  children: ReactNode
}

// The mascot's most substantial role on the site: it narrates every single
// stage here, not a one-off cameo -- the same character from the nav,
// NotFoundPage, and the About page cameo, just given an actual job this
// time. Mood shifts with what's happening in the current stage rather than
// staying static throughout.
export function JourneyGuide({ mood, children }: JourneyGuideProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
      <Mascot mood={mood} className="h-10 w-10 shrink-0" label={`PacketNova, ${mood}`} />
      <p className="text-sm text-fg-muted">{children}</p>
    </div>
  )
}

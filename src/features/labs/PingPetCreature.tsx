import { Mascot, type MascotMood } from '../../components/ui/Mascot'

// Kept as a thin wrapper so every existing caller (PingPet, PingPetDuel,
// the homepage Labs teaser) keeps working unchanged -- the actual creature
// now lives in the shared `Mascot` component. `PetStatus` is just the
// latency-flavored name this file always used for the same six moods.
export type PetStatus = MascotMood

interface PingPetCreatureProps {
  status: PetStatus
  className?: string
}

export function PingPetCreature({ status, className = 'h-32 w-32' }: PingPetCreatureProps) {
  return <Mascot mood={status} className={className} label={`Ping pet, currently ${status}`} />
}

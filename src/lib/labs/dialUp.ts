export interface DialUpPhase {
  label: string
  durationMs: number
}

export const DIAL_UP_PHASES: DialUpPhase[] = [
  { label: 'Dialing...', durationMs: 1000 },
  { label: 'Ringing...', durationMs: 900 },
  { label: 'Carrier detected...', durationMs: 900 },
  { label: 'Handshaking...', durationMs: 1800 },
  { label: 'Negotiating protocol...', durationMs: 1200 },
  { label: 'Connected at 56,000 bps.', durationMs: 0 },
]

export function totalDialUpDurationMs(): number {
  return DIAL_UP_PHASES.reduce((sum, phase) => sum + phase.durationMs, 0)
}

function playTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gainValue = 0.1,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(gainValue, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration)
}

function playSweep(
  ctx: AudioContext,
  fromFreq: number,
  toFreq: number,
  start: number,
  duration: number,
  gainValue = 0.1,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(fromFreq, start)
  osc.frequency.linearRampToValueAtTime(toFreq, start + duration)
  gain.gain.setValueAtTime(gainValue, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration)
}

function playNoiseBurst(ctx: AudioContext, start: number, duration: number, gainValue = 0.05) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(gainValue, start)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  noise.connect(gain)
  gain.connect(ctx.destination)
  noise.start(start)
}

// A synthesized approximation of the classic dial-up handshake -- dial
// tone, DTMF-style dialing beeps, a carrier whine, then a warbling
// negotiation burst. Not a sample of the real sound (no licensed audio
// assets), just enough of the shape to be instantly recognizable.
export function playDialUpSequence(ctx: AudioContext) {
  const t0 = ctx.currentTime + 0.05
  playTone(ctx, 350, t0, 0.5)
  playTone(ctx, 440, t0, 0.5)

  let t = t0 + 0.6
  const dtmfFreqs = [697, 770, 852, 941, 1209, 1336, 1477]
  for (let i = 0; i < 7; i++) {
    playTone(ctx, dtmfFreqs[i % dtmfFreqs.length]!, t, 0.12, 0.08)
    playTone(ctx, dtmfFreqs[(i + 3) % dtmfFreqs.length]!, t, 0.12, 0.08)
    t += 0.16
  }

  t += 0.3
  playTone(ctx, 480, t, 0.4, 0.08)
  playTone(ctx, 620, t, 0.4, 0.08)
  t += 0.6

  playSweep(ctx, 1800, 2600, t, 0.5)
  t += 0.6

  for (let i = 0; i < 8; i++) {
    playSweep(ctx, 900 + Math.random() * 1400, 900 + Math.random() * 1400, t, 0.25)
    playNoiseBurst(ctx, t, 0.25)
    t += 0.28
  }
}

export function createAudioContext(): AudioContext | null {
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null
  return new AudioContextClass()
}

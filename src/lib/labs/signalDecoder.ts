const MORSE_MAP: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
}

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map((char) => (char === ' ' ? '/' : (MORSE_MAP[char] ?? '')))
    .filter(Boolean)
    .join(' ')
}

export function textToBinary(text: string): string {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ')
}

export function textToHex(text: string): string {
  return Array.from(text)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ')
}

export function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export type EncodingStage = 'text' | 'morse' | 'binary' | 'hex' | 'base64'

export const ENCODING_STAGES: EncodingStage[] = ['text', 'morse', 'binary', 'hex', 'base64']

export const STAGE_LABELS: Record<EncodingStage, string> = {
  text: 'Text',
  morse: 'Morse',
  binary: 'Binary',
  hex: 'Hex',
  base64: 'Base64',
}

export function encodeForStage(text: string, stage: EncodingStage): string {
  switch (stage) {
    case 'text':
      return text
    case 'morse':
      return textToMorse(text)
    case 'binary':
      return textToBinary(text)
    case 'hex':
      return textToHex(text)
    case 'base64':
      return textToBase64(text)
  }
}

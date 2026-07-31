import type { AIProvider } from './provider'

export const NullProvider: AIProvider = {
  isAvailable: () => false,
  analyze: async () => ({ summary: 'AI features are not yet available.' }),
}

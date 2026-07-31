/// <reference lib="webworker" />
import { testRegex } from './regexTester'

export interface RegexWorkerRequest {
  pattern: string
  flags: string
  text: string
}

self.onmessage = (event: MessageEvent<RegexWorkerRequest>) => {
  const { pattern, flags, text } = event.data
  const result = testRegex(pattern, flags, text)
  self.postMessage(result)
}

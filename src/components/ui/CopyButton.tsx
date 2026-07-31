import { useState } from 'react'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M13 7V4.5A1.5 1.5 0 0 0 11.5 3h-6A1.5 1.5 0 0 0 4 4.5v6A1.5 1.5 0 0 0 5.5 12H7"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L8 14.5L16 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const RESET_DELAY_MS = 1500

// Shared copy-to-clipboard affordance -- used by ResultRow and by every
// tool whose output isn't a ResultRow (formatter textareas, JWT decoder's
// JSON blocks, password generator, certificate SANs).
export function CopyButton({ value, label = 'value', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), RESET_DELAY_MS)
    } catch {
      // Clipboard API unavailable (insecure context, permission denied) --
      // nothing to recover into, the value is still selectable by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : `Copy ${label}`}
      className={`shrink-0 rounded p-1 text-fg-subtle transition-colors hover:text-accent ${className}`}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ToolPageLayout } from '../ToolPageLayout'
import { ToolEducation } from '../ToolEducation'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { CopyButton } from '../../../components/ui/CopyButton'
import {
  calculatePasswordEntropyBits,
  estimateCrackTime,
  generatePassword,
} from '../../../lib/calculations/password'

interface EntropyTier {
  min: number
  label: string
  barClass: string
}

const ENTROPY_TIERS: EntropyTier[] = [
  { min: 0, label: 'Very weak', barClass: 'bg-danger' },
  { min: 28, label: 'Weak', barClass: 'bg-warning' },
  { min: 36, label: 'Reasonable', barClass: 'bg-warning' },
  { min: 60, label: 'Strong', barClass: 'bg-success' },
  { min: 100, label: 'Very strong', barClass: 'bg-success' },
]

const ENTROPY_BAR_MAX_BITS = 128

function entropyTier(bits: number): EntropyTier {
  return [...ENTROPY_TIERS].reverse().find((tier) => bits >= tier.min) ?? ENTROPY_TIERS[0]!
}

export function PasswordGenerator() {
  const [length, setLength] = useState('20')
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)

  // generatePassword is non-deterministic (a fresh random password every
  // call), so it can't just be called plain during render like every other
  // tool's calculation -- that would compute a *different* password on
  // every unrelated re-render. Memoizing on the options plus a manual
  // "nonce" gets both: automatic recompute when an option changes, and an
  // explicit new password only when the button bumps the nonce.
  const [regenerateNonce, setRegenerateNonce] = useState(0)
  const calc = useMemo(
    () => generatePassword({ length: Number(length), uppercase, lowercase, digits, symbols }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [length, uppercase, lowercase, digits, symbols, regenerateNonce],
  )

  function regenerate() {
    setRegenerateNonce((n) => n + 1)
  }

  const entropyBits = calculatePasswordEntropyBits({
    length: Number(length),
    uppercase,
    lowercase,
    digits,
    symbols,
  })
  const tier = entropyTier(entropyBits)
  const entropyPercent = Math.min(100, (entropyBits / ENTROPY_BAR_MAX_BITS) * 100)
  const crackTime = estimateCrackTime(entropyBits)

  return (
    <ToolPageLayout
      category="Security"
      title="Password generator"
      description="Generate strong, random passwords using your browser's cryptographically secure random number generator."
      input={
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="password-length" className="text-sm font-medium">
              Length
            </label>
            <Input
              id="password-length"
              className="mt-2"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
            <input
              type="range"
              aria-label="Password length, drag to explore"
              min={4}
              max={64}
              step={1}
              value={Math.min(64, Math.max(4, Number(length) || 4))}
              onChange={(e) => setLength(e.target.value)}
              className="mt-3 w-full accent-accent"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
              />
              Uppercase (A-Z)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => setLowercase(e.target.checked)}
              />
              Lowercase (a-z)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={digits}
                onChange={(e) => setDigits(e.target.checked)}
              />
              Digits (0-9)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={symbols}
                onChange={(e) => setSymbols(e.target.checked)}
              />
              Symbols (!@#$...)
            </label>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>Entropy</span>
              <span className="font-mono">
                {entropyBits.toFixed(1)} bits -- {tier.label}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-out ${tier.barClass}`}
                style={{ width: `${entropyPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-fg-subtle">
              At {crackTime.guessesPerSecond.toLocaleString()} guesses/sec (a realistic offline
              attack rate against a fast hash), brute-forcing this would take{' '}
              <span className="font-medium text-fg">{crackTime.humanReadable}</span> on average.
            </p>
          </div>
          <Button type="button" onClick={regenerate} className="self-start">
            Generate new password
          </Button>
        </div>
      }
      result={
        calc.ok ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-bg p-3">
            <p className="min-w-0 break-all font-mono text-sm">{calc.result}</p>
            <CopyButton value={calc.result} label="password" />
          </div>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    >
      <ToolEducation
        howItWorks={
          <p>
            Every character is chosen using the browser's cryptographically secure random number
            generator (<code className="font-mono">crypto.getRandomValues</code>), not{' '}
            <code className="font-mono">Math.random</code>, which isn't safe for anything
            security-sensitive because its output can be predicted. Entropy (shown in bits) measures
            how many possible passwords the current length and character-set settings could produce
            -- more bits means more guesses an attacker needs on average before finding the right
            one. The crack-time estimate turns that bit count into a felt duration: it assumes an
            attacker finds the answer halfway through an exhaustive search on average, at a fixed
            guess rate representative of a fast offline attack against a weakly-hashed password --
            an actual attack could be faster or (against a properly slow password hash) vastly
            slower.
          </p>
        }
        whenToUseThis={
          <p>
            Use this to generate a fresh, unique password for a new account or service -- reusing
            passwords across sites is what turns one breach into many, since a leaked password gets
            tried against every other account tied to that email. Pair generated passwords with a
            password manager rather than trying to remember them; a password strong enough to resist
            guessing is, by design, not meant to be memorable.
          </p>
        }
        commonMistakes={
          <p>
            Choosing a short length to make a password "easier to type" undermines the entire point
            -- length contributes far more entropy than character-set variety, so a longer
            all-lowercase password can be stronger than a short one mixing every character class.
            Reusing a generated password across multiple accounts is another common mistake that
            defeats the purpose of generating a unique one in the first place.
          </p>
        }
        troubleshootingTips={
          <p>
            If a service rejects a generated password for containing "invalid characters," it's
            almost always the symbol set -- try regenerating with symbols disabled, since some
            legacy login forms reject a narrower set of special characters than this tool allows by
            default.
          </p>
        }
        relatedReading={
          <p>
            Need to hash a password for storage instead of generating one to remember?{' '}
            <Link to="/tools/hash-generator" className="text-accent hover:underline">
              Hash generator
            </Link>{' '}
            explains why raw hashes shouldn't be used for that either.
          </p>
        }
      />
    </ToolPageLayout>
  )
}

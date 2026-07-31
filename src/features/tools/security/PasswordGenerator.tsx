import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { Input } from '../../../components/ui/Input'
import { Button } from '../../../components/ui/Button'
import { generatePassword } from '../../../lib/calculations/password'

export function PasswordGenerator() {
  const [length, setLength] = useState('20')
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [password, setPassword] = useState<string | null>(null)

  function regenerate() {
    const calc = generatePassword({ length: Number(length), uppercase, lowercase, digits, symbols })
    setPassword(calc.ok ? calc.result : null)
  }

  const calc = generatePassword({ length: Number(length), uppercase, lowercase, digits, symbols })

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
          <Button type="button" onClick={regenerate} className="self-start">
            Generate new password
          </Button>
        </div>
      }
      result={
        calc.ok ? (
          <p className="break-all rounded-md border border-border bg-bg p-3 font-mono text-sm">
            {password ?? calc.result}
          </p>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

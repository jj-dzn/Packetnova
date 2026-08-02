import { useState } from 'react'
import { ToolPageLayout } from '../ToolPageLayout'
import { ResultRow } from '../ResultRow'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { dateToEpoch, epochToDate } from '../../../lib/calculations/epochConverter'

export function EpochConverter() {
  const [mode, setMode] = useState<'epochToDate' | 'dateToEpoch'>('epochToDate')
  const [epoch, setEpoch] = useState(() => String(Math.floor(Date.now() / 1000)))
  const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds')
  const [dateInput, setDateInput] = useState(() => new Date().toISOString())

  const calc = mode === 'epochToDate' ? epochToDate(Number(epoch), unit) : dateToEpoch(dateInput)

  return (
    <ToolPageLayout
      category="Utilities"
      title="Epoch converter"
      description="Convert between Unix epoch time and human-readable dates. Epoch time is just a count of seconds elapsed since midnight UTC on January 1, 1970 -- no timezone, no calendar, just one number that keeps increasing, which is why so many logs and APIs use it instead of a formatted date."
      input={
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('epochToDate')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'epochToDate' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Epoch to date
            </button>
            <button
              type="button"
              onClick={() => setMode('dateToEpoch')}
              className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${mode === 'dateToEpoch' ? 'border-accent text-accent' : 'border-border text-fg-muted'}`}
            >
              Date to epoch
            </button>
          </div>
          {mode === 'epochToDate' ? (
            <div className="flex gap-2">
              <Input
                className="min-w-[8rem] flex-1"
                value={epoch}
                onChange={(e) => setEpoch(e.target.value)}
                aria-label="Epoch value"
              />
              <Select
                className="w-40"
                value={unit}
                onChange={(e) => setUnit(e.target.value as 'seconds' | 'milliseconds')}
              >
                <option value="seconds">Seconds</option>
                <option value="milliseconds">Milliseconds</option>
              </Select>
            </div>
          ) : (
            <Input
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              placeholder="2026-01-01T00:00:00.000Z"
              aria-label="Date/time"
            />
          )}
        </div>
      }
      result={
        calc.ok ? (
          <dl>
            <ResultRow label="Epoch (seconds)" value={String(calc.result.epochSeconds)} />
            <ResultRow label="Epoch (milliseconds)" value={String(calc.result.epochMillis)} />
            <ResultRow label="ISO 8601" value={calc.result.iso} />
            <ResultRow label="UTC" value={calc.result.utc} />
          </dl>
        ) : (
          <p className="text-sm text-danger">{calc.error}</p>
        )
      }
    />
  )
}

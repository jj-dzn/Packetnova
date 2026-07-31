export type CalculationResult<T> = { ok: true; result: T } | { ok: false; error: string }

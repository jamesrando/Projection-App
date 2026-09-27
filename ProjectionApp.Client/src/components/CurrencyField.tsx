import { useEffect, useId, useState } from 'react'
import { currencySymbol, parseCurrencyInput } from '../format/currency'

export function validateCurrencyInput(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }

  const normalized = trimmed.replace(/[£$,]/g, '')
  const parsed = Number(normalized)

  if (!Number.isFinite(parsed)) {
    return 'Enter a valid amount'
  }

  if (parsed < 0) {
    return 'Amount cannot be negative'
  }

  return null
}

interface CurrencyFieldProps {
  id: string
  label: string
  hint: string
  value: number | null
  disabled?: boolean
  error?: string | null
  onChange: (value: number | null) => void
  onError?: (error: string | null) => void
}

export function CurrencyField({
  id,
  label,
  hint,
  value,
  disabled = false,
  error = null,
  onChange,
  onError,
}: CurrencyFieldProps) {
  const [draft, setDraft] = useState(value === null ? '' : String(value))
  const errorId = useId()

  useEffect(() => {
    setDraft(value === null ? '' : String(value))
  }, [value])

  function handleBlur() {
    const validationError = validateCurrencyInput(draft)
    if (validationError) {
      onError?.(validationError)
      setDraft(value === null ? '' : String(value))
      return
    }

    onError?.(null)
    const parsed = parseCurrencyInput(draft)
    onChange(parsed)
    setDraft(parsed === null ? '' : String(parsed))
  }

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`profile-field__input-wrap${error ? ' profile-field__input-wrap--error' : ''}`}>
        <span className="profile-field__prefix" aria-hidden="true">
          {currencySymbol}
        </span>
        <input
          id={id}
          className="profile-field__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={draft}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
        />
      </div>
      {error ? (
        <p id={errorId} className="profile-field__error" role="alert">
          {error}
        </p>
      ) : (
        <p className="profile-field__hint">{hint}</p>
      )}
    </div>
  )
}

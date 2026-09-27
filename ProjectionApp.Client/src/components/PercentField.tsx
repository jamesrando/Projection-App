import { useEffect, useId, useState } from 'react'
import { parsePercentInput, validatePercentInput } from '../format/percent'

interface PercentFieldProps {
  id: string
  label: string
  hint: string
  value: number | null
  disabled?: boolean
  error?: string | null
  onChange: (value: number | null) => void
  onError?: (error: string | null) => void
}

export function PercentField({
  id,
  label,
  hint,
  value,
  disabled = false,
  error = null,
  onChange,
  onError,
}: PercentFieldProps) {
  const [draft, setDraft] = useState(value === null ? '' : String(value))
  const errorId = useId()

  useEffect(() => {
    setDraft(value === null ? '' : String(value))
  }, [value])

  function handleBlur() {
    const validationError = validatePercentInput(draft)
    if (validationError) {
      onError?.(validationError)
      setDraft(value === null ? '' : String(value))
      return
    }

    onError?.(null)
    const parsed = parsePercentInput(draft)
    onChange(parsed)
    setDraft(parsed === null ? '' : String(parsed))
  }

  return (
    <div className="profile-field">
      <label className="profile-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`profile-field__input-wrap${error ? ' profile-field__input-wrap--error' : ''}`}>
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
        <span className="profile-field__suffix" aria-hidden="true">
          %
        </span>
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

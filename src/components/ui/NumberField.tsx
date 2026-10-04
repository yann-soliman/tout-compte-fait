import { useId, type ReactNode } from 'react'
import { InfoTip } from './InfoTip'

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  suffix?: string
  min?: number
  max?: number
  step?: number
  info?: string
  icon?: ReactNode
  compact?: boolean
  error?: string
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  max,
  step = 1,
  info,
  icon,
  compact = false,
  error,
}: NumberFieldProps) {
  const id = useId()
  return (
    <div className={`field ${compact ? 'field--compact' : ''}`}>
      <span className="field__label">
        <label htmlFor={id}>
          {icon}
          {label}
        </label>
        {info && <InfoTip label={label}>{info}</InfoTip>}
      </span>
      <span className="field__control">
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            const next = event.target.valueAsNumber
            onChange(Number.isFinite(next) ? next : 0)
          }}
        />
        {suffix && <span className="field__suffix">{suffix}</span>}
      </span>
      {error && (
        <span className="field__error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

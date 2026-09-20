interface SegmentedOption<T extends string | number> {
  label: string
  value: T
}

interface SegmentedControlProps<T extends string | number> {
  label: string
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  compact?: boolean
}

export function SegmentedControl<T extends string | number>({
  label,
  value,
  options,
  onChange,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={`segmented-field ${compact ? 'segmented-field--compact' : ''}`}>
      <legend>{label}</legend>
      <span className="segmented-control">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            className={option.value === value ? 'is-active' : undefined}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </span>
    </fieldset>
  )
}

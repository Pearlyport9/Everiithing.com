interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

let inputIdCounter = 0

export function Input({ label, error, className = '', id: externalId, ...props }: InputProps) {
  const fallbackId = `input-${++inputIdCounter}`
  const inputId = externalId || (label ? fallbackId : undefined)
  const errorId = error && inputId ? `${inputId}-error` : undefined

  const isDateOrTime = props.type === 'date' || props.type === 'time'

  const input = (
    <input
      id={inputId}
      aria-invalid={error ? true : undefined}
      aria-describedby={errorId}
      className={`input-field ${error ? 'border-token-error' : ''} ${className}`}
      {...props}
    />
  )

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-token-onSurface mb-1">
          {label}
        </label>
      )}
      {isDateOrTime ? (
        <div className={`input-field-wrapper ${error ? 'border-token-error' : ''}`}>
          {input}
        </div>
      ) : input}
      {error && <p id={errorId} role="alert" className="text-token-error text-xs mt-1">{error}</p>}
    </div>
  )
}

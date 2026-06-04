interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-navy-900 mb-1">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  )
}

'use client'

interface FieldRowProps {
  label: string
  value: string
  readOnly?: boolean
}

export function FieldRow({ label, value, readOnly }: FieldRowProps) {
  return (
    <div className={`px-4 py-3 rounded-lg ${readOnly ? 'opacity-70' : ''}`} style={{ backgroundColor: 'var(--color-surfaceContainerLow)' }}>
      <p className="text-xs font-medium uppercase tracking-wider text-token-onSurfaceVariant mb-0.5">{label}</p>
      <p className="text-sm font-medium text-token-onSurface">{value || '\u2014'}</p>
    </div>
  )
}

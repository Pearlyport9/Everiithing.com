'use client'

import { Pencil } from 'lucide-react'

interface EditableFieldProps {
  label: string
  value: string
  editing: boolean
  onChange?: (val: string) => void
  readOnly?: boolean
  placeholder?: string
  type?: string
}

export function EditableField({
  label, value, editing, onChange, readOnly, placeholder, type = 'text',
}: EditableFieldProps) {
  if (editing && onChange) {
    return (
      <div>
        <label className="block text-xs font-medium text-token-onSurfaceVariant mb-1">{label}</label>
        <input
          type={type}
          className="input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : undefined}
        />
      </div>
    )
  }

  return (
    <div className={`px-4 py-3 rounded-lg ${readOnly ? 'opacity-70' : ''}`} style={{ backgroundColor: 'var(--color-surfaceContainerLow)' }}>
      <p className="text-xs font-medium uppercase tracking-wider text-token-onSurfaceVariant mb-0.5">{label}</p>
      <p className="text-sm font-medium text-token-onSurface">{value || '\u2014'}</p>
    </div>
  )
}

'use client'

import { Pencil } from 'lucide-react'

interface ProfileCardProps {
  title: string
  editing?: boolean
  onToggleEdit?: () => void
  saving?: boolean
  children: React.ReactNode
}

export function ProfileCard({ title, editing, onToggleEdit, saving, children }: ProfileCardProps) {
  return (
    <section
      className="bg-token-surface rounded-xl p-6"
      style={{ boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-lg text-token-onSurface">{title}</h3>
        {onToggleEdit && (
          <button
            onClick={onToggleEdit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{ color: editing ? 'var(--color-primary)' : 'var(--color-onSurfaceVariant)' }}
          >
            {editing ? (
              saving ? 'Saving...' : 'Save'
            ) : (
              <>
                <Pencil size={14} />
                Edit
              </>
            )}
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

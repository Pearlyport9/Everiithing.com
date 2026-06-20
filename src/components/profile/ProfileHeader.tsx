'use client'

interface ProfileHeaderProps {
  fullName: string
  role: string
  location: string
}

export function ProfileHeader({ fullName, role, location }: ProfileHeaderProps) {
  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div
      className="bg-token-surface rounded-xl p-6 flex items-center gap-5"
      style={{ boxShadow: '0 1px 4px rgba(13, 16, 33, 0.03)' }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-display font-bold shrink-0"
        style={{ backgroundColor: 'var(--color-primaryContainer)', color: 'var(--color-onPrimaryContainer)' }}
      >
        {initials}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-token-onSurface">{fullName}</h2>
        <p className="text-sm font-medium text-token-tertiary">{role}</p>
        <p className="text-xs text-token-onSurfaceVariant">{location}</p>
      </div>
    </div>
  )
}

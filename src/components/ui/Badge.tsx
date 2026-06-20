interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const styles = {
    default: 'bg-token-surfaceVariant text-token-onSurfaceVariant',
    success: 'bg-token-primaryContainer text-token-onPrimaryContainer',
    warning: 'bg-token-secondary/10 text-token-secondary',
    error: 'bg-token-error/10 text-token-error',
    info: 'bg-token-primary/10 text-token-primary',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

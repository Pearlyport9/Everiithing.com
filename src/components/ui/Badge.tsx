interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const styles = {
    default: 'bg-neutral-100 text-neutral-700',
    success: 'bg-success-light text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

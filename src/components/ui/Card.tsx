interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, className = '', hover = true, onClick, style }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 bg-token-surface shadow-sm border border-token-outlineVariant ${
        hover ? 'transition-all duration-base hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      style={style}
    >
      {children}
    </div>
  )
}

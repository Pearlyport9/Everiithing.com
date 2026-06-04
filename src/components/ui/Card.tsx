interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 bg-white shadow-sm border border-neutral-100 ${
        hover ? 'transition-all duration-base hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

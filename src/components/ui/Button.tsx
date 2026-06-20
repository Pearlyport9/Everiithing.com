interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark'
  children: React.ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'px-7 py-3 rounded-full font-semibold text-base transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center'
  const variants = {
    primary: 'bg-token-tertiary text-token-onTertiary hover:brightness-110 hover:shadow-lg focus:ring-token-tertiary',
    secondary: 'bg-transparent border-2 border-token-primary text-token-primary hover:bg-token-primary hover:text-token-onPrimary focus:ring-token-primary',
    dark: 'bg-token-inverseSurface text-token-inverseOnSurface hover:brightness-125 focus:ring-token-inverseSurface',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark'
  children: React.ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'px-7 py-3 rounded-full font-semibold text-base transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center'
  const variants = {
    primary: 'bg-accent-500 text-white hover:bg-accent-600 hover:shadow-lg focus:ring-accent-500',
    secondary: 'bg-transparent border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white focus:ring-navy-900',
    dark: 'bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-900',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

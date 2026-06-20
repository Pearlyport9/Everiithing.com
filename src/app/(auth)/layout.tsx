import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="absolute top-0 left-0 w-full px-6 py-4">
        <Link href="/" aria-label="Home" className="inline-flex items-center">
          <img src="/footer-logo.svg" alt="Everiithing" className="h-8 w-auto" />
        </Link>
      </div>
      <div className="w-full max-w-[520px] p-6 md:p-8">{children}</div>
    </div>
  )
}

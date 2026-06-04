export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-navy-900 text-white px-8 py-4">
        <h1 className="text-xl font-display font-bold">Everiithing Admin</h1>
      </header>
      <div className="flex">
        <nav className="w-64 bg-white border-r border-neutral-100 min-h-screen p-4">
          <ul className="space-y-2">
            {[
              { href: '/admin', label: 'Dashboard' },
              { href: '/admin/providers', label: 'Providers' },
              { href: '/admin/verification', label: 'Verification' },
              { href: '/admin/bookings', label: 'Bookings' },
              { href: '/admin/disputes', label: 'Disputes' },
              { href: '/admin/pricing', label: 'Pricing' },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block px-4 py-2 rounded-lg hover:bg-neutral-100 text-neutral-700 hover:text-navy-900 font-medium transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

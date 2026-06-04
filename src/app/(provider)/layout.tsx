import Link from 'next/link'
import { LayoutDashboard, Briefcase, User, LogOut } from 'lucide-react'

const sidebarLinks = [
  { href: '/provider/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/provider/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/provider/dashboard/profile', label: 'Profile', icon: User },
]

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="w-64 bg-white border-r border-neutral-100 min-h-screen flex flex-col">
        <div className="p-4 border-b border-neutral-100">
          <Link href="/" className="font-display font-extrabold text-lg tracking-tight text-navy-900">
            Everiithing<span className="text-accent-500">.</span>com
          </Link>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-700 hover:bg-neutral-100 hover:text-navy-900 font-medium text-sm transition-colors"
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-neutral-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-neutral-500 hover:text-error text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

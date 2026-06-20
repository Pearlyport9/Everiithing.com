'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, CalendarPlus,
  User, X, LogOut, Sun, Moon,
} from 'lucide-react'
import { TopBar } from '@/components/dashboard/TopBar'
import { useTheme } from '@/hooks/useTheme'

const mainMenu = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: Calendar },
  { href: '/dashboard/book', label: 'Book a Service', icon: CalendarPlus },
]

const accountMenu = [
  { href: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [userInfo, setUserInfo] = useState({ fullName: '', email: '' })
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
          setUserInfo({
            fullName: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email || '',
          })
        }
      } catch { /* silently fail */ }
    }
    load()
  }, [])

  const isActive = (href: string) => pathname === href

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // proceed with redirect regardless
    }
    router.push('/login')
  }

  return (
    <div data-theme={theme} className="min-h-screen" style={{ backgroundColor: 'var(--color-surfaceContainerLow)' }}>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full w-[260px] border-r flex flex-col z-50
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
        style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', borderColor: 'var(--color-outlineVariant)' }}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-5">
          <Link href="/" aria-label="Home" className="flex items-center">
            <img src={theme === 'dark' ? '/logo.svg' : '/footer-logo.svg'} alt="Everiithing" width={32} height={32} className="h-8 w-auto" />
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden bg-transparent border-none p-1 cursor-pointer" aria-label="Close menu">
            <X size={18} style={{ color: 'var(--color-onSurfaceVariant)' }} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="mb-2 px-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              MAIN MENU
            </span>
          </div>
          {mainMenu.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out',
                  active
                    ? 'bg-[var(--color-primary)] text-[var(--color-onPrimary)]'
                    : 'text-[var(--color-onSurfaceVariant)] hover:bg-[color-mix(in_srgb,var(--color-primaryContainer)_40%,transparent)] hover:text-[var(--color-onSurface)]',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          })}

          <div className="mt-6 mb-2 px-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-onSurfaceVariant)' }}>
              ACCOUNT
            </span>
          </div>
          {accountMenu.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-out',
                  active
                    ? 'bg-[var(--color-primary)] text-[var(--color-onPrimary)]'
                    : 'text-[var(--color-onSurfaceVariant)] hover:bg-[color-mix(in_srgb,var(--color-primaryContainer)_40%,transparent)] hover:text-[var(--color-onSurface)]',
                ].join(' ')}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors lg:hidden"
            style={{ color: 'var(--color-onSurfaceVariant)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-onSurfaceVariant)'}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--color-onSurfaceVariant)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-onSurfaceVariant)'}
          >
            <LogOut size={18} strokeWidth={1.5} />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </aside>

      <main className="lg:ml-[260px] min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <TopBar
            variant="customer"
            fullName={userInfo.fullName}
            email={userInfo.email}
            profileHref="/dashboard/profile"
            theme={theme}
            onToggleTheme={toggleTheme}
            onMenuToggle={() => setMobileOpen(!mobileOpen)}
          />
          {children}
        </div>
      </main>
    </div>
  )
}

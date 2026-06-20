'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, LogOut, User, Loader2, Sun, Moon, Menu } from 'lucide-react'

interface TopBarProps {
  variant: 'admin' | 'customer'
  fullName: string
  email: string
  profileHref: string
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
  onMenuToggle?: () => void
}

export function TopBar({ variant, fullName, email, profileHref, theme, onToggleTheme, onMenuToggle }: TopBarProps) {
  const router = useRouter()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const avatarRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setSearchOpen(false); setSearchQuery('') }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') { setAvatarOpen(false); setSearchOpen(false); setSearchQuery('') }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch { /* proceed */ }
    router.push('/login')
  }

  const handleSearchFocus = () => {
    setAvatarOpen(false)
    setSearchOpen(true)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const isDark = theme === 'dark'
  const searchBg = isDark ? 'var(--color-surfaceVariant)' : 'var(--color-surfaceContainerLowest)'
  const searchFg = 'var(--color-onSurface)'
  const searchIconColor = isDark ? 'var(--color-onSurface)' : 'var(--color-onSurfaceVariant)'

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 px-3 md:px-6 py-3 mb-6 bg-[var(--color-inverseSurface)] rounded-2xl"
    >
      {/* Hamburger (mobile/tablet) — order-1 */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-10 h-10 flex items-center justify-center order-1 shrink-0 text-[var(--color-inverseOnSurface)] mr-auto md:mr-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Brand (mobile) — order-2 */}
      <Link
        href="/"
        aria-label="Home"
        className="hidden order-2 flex items-center justify-center"
      >
        <img src={theme === 'dark' ? '/footer-logo.svg' : '/logo.svg'} alt="Everiithing" width={28} height={28} className="h-7 w-auto" />
      </Link>

      {/* Theme toggle — order-3 on mobile, order-3 at tablet, order-5 at desktop */}
      {onToggleTheme && (
        <div className="order-5 md:order-3 lg:order-5">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 hover:scale-105 text-[var(--color-inverseOnSurface)]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      )}

      {/* Avatar — order-4 on mobile, order-4 at tablet, order-6 at desktop */}
      <div ref={avatarRef} className="relative shrink-0 order-4 md:order-4 lg:order-6">
        <button
          onClick={() => { setSearchOpen(false); setAvatarOpen(!avatarOpen) }}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-150 hover:scale-105"
          style={{ backgroundColor: 'var(--color-surfaceContainerLow)', color: 'var(--color-onSurface)' }}
          aria-label="User menu"
        >
          <span className="text-sm font-semibold">{initials}</span>
        </button>

        {avatarOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-lg z-50 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surfaceContainerLowest)', borderColor: 'var(--color-outlineVariant)' }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-outlineVariant)' }}>
              <p className="text-sm font-medium text-token-onSurface truncate">{fullName || 'User'}</p>
              <p className="text-xs text-token-onSurfaceVariant truncate">{email}</p>
            </div>
            <div className="py-1">
              <Link
                href={profileHref}
                onClick={() => setAvatarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-token-surfaceContainerLow"
                style={{ color: 'var(--color-onSurface)' }}
              >
                <User size={16} style={{ color: 'var(--color-onSurfaceVariant)' }} />
                My Profile
              </Link>
              <button
                onClick={() => { setAvatarOpen(false); handleLogout() }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-token-surfaceContainerLow"
                style={{ color: 'var(--color-onSurfaceVariant)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-onSurfaceVariant)'}
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search — order-6 w-full on mobile, order-2 flex-1 at tablet, order-1 w-[45%] at desktop */}
      <div
        ref={searchRef}
        className="relative w-full md:flex-1 lg:flex-1 xl:w-[45%] xl:flex-none order-6 md:order-2 lg:order-1 mt-2 md:mt-0 lg:mt-0"
      >
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={variant === 'admin' ? 'Search providers or bookings...' : 'Search your bookings or services...'}
            value={searchQuery}
            onFocus={handleSearchFocus}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border-none pl-4 pr-10 py-2.5 text-sm outline-none"
            style={{ backgroundColor: searchBg, color: searchFg, minHeight: '44px', fontFamily: 'Satoshi, sans-serif' }}
          />
          <Search
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: searchIconColor }}
          />
        </div>

        {searchOpen && (
          variant === 'admin'
            ? <AdminSearchDropdown query={searchQuery} setQuery={setSearchQuery} onClose={closeSearch} theme={theme} />
            : <CustomerSearchDropdown query={searchQuery} setQuery={setSearchQuery} onClose={closeSearch} theme={theme} />
        )}
      </div>

      {/* Date — hidden on mobile/tablet, order-2 at desktop */}
      <p
        className="hidden xl:block text-sm font-medium flex-1 text-center order-7 lg:order-7 xl:order-2"
        style={{ color: 'var(--color-inverseOnSurface)' }}
      >
        {dateStr}
      </p>
    </div>
  )
}

/* ── Admin search dropdown ── */
function AdminSearchDropdown({ query, setQuery, onClose, theme }: { query: string; setQuery: (v: string) => void; onClose: () => void; theme?: 'light' | 'dark' }) {
  const [providers, setProviders] = useState<{ id: string; full_name: string }[]>([])
  const [bookings, setBookings] = useState<{ id: string; service_name?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) { setProviders([]); setBookings([]); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const [provRes, bookRes] = await Promise.all([
          fetch(`/api/admin/providers/search?q=${encodeURIComponent(query)}`),
          fetch(`/api/admin/bookings/search?q=${encodeURIComponent(query)}`),
        ])
        setProviders(((await provRes.json()).data ?? []).slice(0, 5))
        setBookings(((await bookRes.json()).data ?? []).slice(0, 5))
      } catch { setProviders([]); setBookings([]) }
      setLoading(false)
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  useEffect(() => {
    if (query.length < 2) setLoading(false)
  }, [query])

  const hasResults = providers.length > 0 || bookings.length > 0

  const isDark = theme === 'dark'
  const bg = isDark ? 'var(--color-surfaceVariant)' : 'var(--color-surfaceContainerLowest)'
  const fg = 'var(--color-onSurface)'
  const muted = isDark ? 'var(--color-onSurface)' : 'var(--color-onSurfaceVariant)'
  const accent = isDark ? 'var(--color-primary)' : 'var(--color-onSurface)'

  return (
    <div className="absolute left-0 top-full mt-2 w-full rounded-xl border shadow-lg z-50 overflow-hidden" style={{ backgroundColor: bg, borderColor: 'var(--color-outlineVariant)' }}>
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin" style={{ color: muted }} />
        </div>
      )}

      {!loading && query.length >= 2 && !hasResults && (
        <p className="px-4 py-6 text-sm text-center" style={{ color: fg }}>
          No results for &lsquo;{query}&rsquo;
        </p>
      )}

      {!loading && query.length >= 2 && hasResults && (
        <div className="py-1">
          {providers.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: muted }}>Providers</p>
              {providers.map((p) => (
                <button key={p.id} onClick={() => { onClose(); window.location.href = '/admin/providers' }}
                  className="flex w-full text-left items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-token-surfaceContainerLow"
                  style={{ color: accent }}>{p.full_name}</button>
              ))}
            </>
          )}
          {bookings.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: muted }}>Bookings</p>
              {bookings.map((b) => (
                <button key={b.id} onClick={() => { onClose(); window.location.href = '/admin/bookings' }}
                  className="block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-token-surfaceContainerLow"
                  style={{ color: accent }}>{b.service_name || b.id.slice(0, 8)}</button>
              ))}
            </>
          )}
        </div>
      )}

      {query.length > 0 && query.length < 2 && (
        <p className="px-4 py-3 text-xs text-center" style={{ color: muted }}>Type at least 2 characters</p>
      )}
    </div>
  )
}

/* ── Customer search dropdown ── */
function CustomerSearchDropdown({ query, setQuery, onClose, theme }: { query: string; setQuery: (v: string) => void; onClose: () => void; theme?: 'light' | 'dark' }) {
  const [bookings, setBookings] = useState<{ id: string; service_name?: string }[]>([])
  const [services, setServices] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) { setBookings([]); setServices([]); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const [bookRes, svcRes] = await Promise.all([
          fetch(`/api/customer/search/bookings?q=${encodeURIComponent(query)}`),
          fetch(`/api/customer/search/services?q=${encodeURIComponent(query)}`),
        ])
        setBookings(((await bookRes.json()).data ?? []).slice(0, 5))
        setServices(((await svcRes.json()).data ?? []).slice(0, 5))
      } catch { setBookings([]); setServices([]) }
      setLoading(false)
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  useEffect(() => {
    if (query.length < 2) setLoading(false)
  }, [query])

  const hasResults = bookings.length > 0 || services.length > 0

  const isDark = theme === 'dark'
  const bg = isDark ? 'var(--color-surfaceVariant)' : 'var(--color-surfaceContainerLowest)'
  const fg = 'var(--color-onSurface)'
  const muted = isDark ? 'var(--color-onSurface)' : 'var(--color-onSurfaceVariant)'
  const accent = isDark ? 'var(--color-primary)' : 'var(--color-onSurface)'

  return (
    <div className="absolute left-0 top-full mt-2 w-full rounded-xl border shadow-lg z-50 overflow-hidden" style={{ backgroundColor: bg, borderColor: 'var(--color-outlineVariant)' }}>
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin" style={{ color: muted }} />
        </div>
      )}

      {!loading && query.length >= 2 && !hasResults && (
        <p className="px-4 py-6 text-sm text-center" style={{ color: fg }}>
          No results for &lsquo;{query}&rsquo;
        </p>
      )}

      {!loading && query.length >= 2 && hasResults && (
        <div className="py-1">
          {bookings.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: muted }}>My Bookings</p>
              {bookings.map((b) => (
                <button key={b.id} onClick={() => { onClose(); window.location.href = `/dashboard/bookings?id=${b.id}` }}
                  className="block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-token-surfaceContainerLow"
                  style={{ color: accent }}>{b.service_name || 'Booking'}</button>
              ))}
            </>
          )}
          {services.length > 0 && (
            <>
              <p className="px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest" style={{ color: muted }}>Services</p>
              {services.map((s) => (
                <button key={s.id} onClick={() => { onClose(); window.location.href = `/dashboard/book?service=${s.id}` }}
                  className="block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-token-surfaceContainerLow"
                  style={{ color: accent }}>{s.name}</button>
              ))}
            </>
          )}
        </div>
      )}

      {query.length > 0 && query.length < 2 && (
        <p className="px-4 py-3 text-xs text-center" style={{ color: muted }}>Type at least 2 characters</p>
      )}
    </div>
  )
}

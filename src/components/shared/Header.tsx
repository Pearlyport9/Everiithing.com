'use client'

import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/faq', label: 'FAQs' },
  { href: '/about', label: 'About' },
  { href: '/become-a-provider', label: 'Become a Provider' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="fixed top-0 z-50 inset-x-0"
      style={{ backgroundColor: 'var(--md-primary)', borderBottom: '1px solid var(--md-primary-container)' }}
    >
      <div className="w-full md:max-w-7xl md:mx-auto px-6 md:px-8 flex items-center justify-between h-16">
        <Link href="/" aria-label="Home" className="flex items-center">
          <img src="/logo.svg" alt="Everiithing" className="h-9 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors duration-200 inline-flex items-center gap-1 hover-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-primary-container)] focus-visible:rounded"
              style={{ color: 'var(--md-on-primary)' }}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <button className="lg:hidden p-2.5" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" style={{ color: 'var(--md-on-primary)' }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex flex-col"
          style={{ backgroundColor: 'var(--md-primary)', top: '64px' }}
          onClick={() => setOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="flex flex-col px-6 pt-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative group text-lg font-medium flex items-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-primary-container)] focus-visible:rounded"
                    style={{ color: 'var(--md-on-primary)' }}
                    onClick={() => setOpen(false)}
                    onTouchStart={() => {}}
                  >
                    <span className="text-center">{link.label}</span>
                    <span className="absolute bottom-0 left-0 h-0.5 bg-[var(--md-tertiary)] w-0 transition-all duration-100 ease group-hover:w-full group-active:w-full" />
                  </Link>
              ))}
            </div>
            <div className="mt-8 pb-8">
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 active:scale-[0.97]"
                style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                onClick={() => setOpen(false)}
              >
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

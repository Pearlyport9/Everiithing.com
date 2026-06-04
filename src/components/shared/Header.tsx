'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/become-a-provider', label: 'Become a Provider' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-50">
      <div className="container-app flex items-center justify-between h-16">
        <Link href="/" className="font-display font-extrabold text-xl tracking-tight">
          Everiithing<span className="text-accent-500">.</span>com
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-300 hover:text-white transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-4">
            <Link href="/login" className="text-sm font-medium hover:text-accent-400 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm !py-2 !px-5">
              Get Started
            </Link>
          </div>
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-navy-700">
          <div className="container-app py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-neutral-300 hover:text-white transition-colors py-1"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-navy-700" />
            <Link
              href="/login"
              className="block text-neutral-300 hover:text-white transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="block text-accent-400 font-medium py-1"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

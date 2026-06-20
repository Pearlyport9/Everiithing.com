import Link from 'next/link'

const navLinks = [
  { href: '/dashboard/book', label: 'Book a Service' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/become-a-provider', label: 'Become a Provider' },
  { href: '/contact', label: 'Contact Us' },
]

const policyLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/refund-policy', label: 'Refund Policy' },
]

const allLinks = [...navLinks, ...policyLinks]

export default function Footer() {
  return (
    <footer
      className="py-8 px-6 max-[1024px]:pt-10 lg:py-6 lg:px-12"
      style={{
        width: '100%',
        backgroundColor: '#E8F4F4',
        borderTop: '1px solid var(--md-outline-variant)',
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:max-w-7xl lg:mx-auto gap-5 lg:gap-0">
        <Link
          href="/"
          aria-label="Home"
          className="self-start lg:self-auto flex items-center"
        >
          <img src="/footer-logo.svg" alt="Everiithing" width={32} height={32} className="h-8 w-auto" />
        </Link>

        <nav className="hidden lg:flex lg:flex-row lg:gap-8" aria-label="Footer navigation">
          {navLinks.map((link) =>
            link.href.startsWith('mailto:') ? (
              <a
                key={link.label}
                href={link.href}
                className="no-underline hover:text-[var(--md-on-surface)] transition-colors duration-200 hover-underline"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="no-underline hover:text-[var(--md-on-surface)] transition-colors duration-200 hover-underline"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <nav className="flex flex-col gap-3 lg:hidden" aria-label="Footer navigation">
          {allLinks.map((link) =>
            link.href.startsWith('mailto:') ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm no-underline hover:underline hover:text-[var(--md-on-surface)] active:underline focus-visible:underline transition-colors duration-200"
                style={{
                  fontWeight: 400,
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm no-underline hover:underline hover:text-[var(--md-on-surface)] active:underline focus-visible:underline transition-colors duration-200"
                style={{
                  fontWeight: 400,
                  color: 'var(--md-on-surface-variant)',
                }}
              >
                {link.label}
              </Link>
            )
          )}
          </nav>
        </div>

      <div
        className="hidden lg:block w-full h-px mb-6 lg:mt-8"
        style={{ backgroundColor: '#C8E0E0' }}
      />

      <div className="hidden lg:flex lg:flex-row-reverse lg:justify-between lg:items-center lg:pt-6">
        <nav className="flex lg:flex-row gap-6" aria-label="Policies">
          {policyLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm no-underline transition-colors duration-200 hover:text-white hover-underline"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              {link.label}
            </Link>
          ))}
          </nav>
        <p
          className="text-xs"
          style={{ color: 'var(--md-on-surface-variant)' }}
        >
          &copy; 2026 Everiithing.com. All rights reserved.
        </p>
      </div>

      <p
        className="text-xs mt-4 lg:hidden"
        style={{ color: 'var(--md-on-surface-variant)' }}
      >
        &copy; 2026 Everiithing.com. All rights reserved.
      </p>
    </footer>
  )
}

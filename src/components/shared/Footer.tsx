import Link from 'next/link'

const footerLinks = [
  {
    heading: 'Services',
    links: [
      { href: '/services/plumbing', label: 'Plumbing' },
      { href: '/services/electrical', label: 'Electrical' },
      { href: '/services/ac-services', label: 'AC Services' },
      { href: '/services/generator-inverter', label: 'Generator & Inverter' },
      { href: '/services/painting', label: 'Painting' },
      { href: '/services/deep-cleaning', label: 'Deep Cleaning' },
      { href: '/services/carpentry', label: 'Carpentry' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/become-a-provider', label: 'Become a Provider' },
      { href: '/services', label: 'All Services' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '#', label: 'Help Center' },
      { href: '#', label: 'Contact Us' },
      { href: '#', label: 'Privacy Policy' },
      { href: '#', label: 'Terms of Service' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-neutral-300">
      <div className="container-app py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display font-extrabold text-xl text-white tracking-tight">
              Everiithing<span className="text-accent-500">.</span>com
            </Link>
            <p className="mt-3 text-sm text-neutral-500 max-w-xs">
              Verified home service professionals in Lagos. Book with confidence.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h4 className="font-display font-semibold text-white text-sm mb-3">
                {group.heading}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-navy-800 mt-12 pt-6 text-sm text-neutral-500 text-center">
          &copy; {new Date().getFullYear()} Everiithing.com. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Everiithing\u2022com \u2014 Verified Home Services in Lagos',
  description:
    'Book trusted plumbers, electricians, AC technicians and more. Verified providers, transparent pricing, satisfaction guaranteed.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 text-navy-900 font-body">{children}</body>
    </html>
  )
}

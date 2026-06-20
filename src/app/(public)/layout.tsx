'use client'

import { useTheme } from '@/hooks/useTheme'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useTheme()

  return (
    <div data-theme={theme} className="overflow-x-hidden max-w-[100vw]">
      <Header />
      <main id="main-content" className="min-h-screen pt-16">{children}</main>
      <Footer />
    </div>
  )
}

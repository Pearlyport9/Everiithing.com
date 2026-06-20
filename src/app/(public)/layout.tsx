import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="overflow-x-hidden max-w-[100vw]">
      <Header />
      <main id="main-content" className="pt-16">{children}</main>
      <Footer />
    </div>
  )
}

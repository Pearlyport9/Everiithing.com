export default function HomePage() {
  return (
    <main>
      <section className="section-padding bg-navy-900 text-white">
        <div className="container-app">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold mb-6">
            Stop Gambling With Your Home
          </h1>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mb-8">
            Book verified home service professionals in Lagos. Every provider
            earned their spot.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="/dashboard/book" className="btn-primary inline-block">
              Book a Service
            </a>
            <a
              href="/become-a-provider"
              className="btn-dark border border-white/20 inline-block"
            >
              Become a Provider
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

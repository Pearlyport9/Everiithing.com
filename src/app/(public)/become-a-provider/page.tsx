export default function BecomeProviderPage() {
  return (
    <main className="section-padding">
      <div className="container-app max-w-3xl text-center">
        <p className="eyebrow mb-2">Join Our Team</p>
        <h1 className="text-4xl font-display font-bold mb-4">
          Become a Verified Provider
        </h1>
        <p className="text-lg text-neutral-500 mb-8">
          Earn steady income by serving homeowners in Lagos. We handle the
          bookings, payments, and marketing.
        </p>
        <a
          href="/signup/provider"
          className="btn-primary inline-block text-lg px-10 py-4"
        >
          Apply Now
        </a>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { title: 'Steady Jobs', desc: 'Get matched with customers in your area and skillset.' },
            { title: 'Fair Pay', desc: 'Keep 82% of every job. Payments released within 24 hours of completion.' },
            { title: 'Full Support', desc: 'We handle disputes, collections, and customer communication.' },
          ].map((item) => (
            <div key={item.title} className="service-card">
              <h3 className="font-display font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

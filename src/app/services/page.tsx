export default function ServicesPage() {
  const categories = [
    { name: 'Plumbing', slug: 'plumbing', description: 'Fixing leaks, pipes, and water systems' },
    { name: 'Electrical', slug: 'electrical', description: 'Wiring, switches, and electrical repairs' },
    { name: 'AC Services', slug: 'ac-services', description: 'Installation, repair, and servicing' },
    { name: 'Generator & Inverter', slug: 'generator-inverter', description: 'Repair and maintenance' },
    { name: 'Painting', slug: 'painting', description: 'Interior and exterior painting' },
    { name: 'Deep Cleaning', slug: 'deep-cleaning', description: 'Professional home cleaning' },
    { name: 'Carpentry', slug: 'carpentry', description: 'Furniture, shelves, and woodwork' },
  ]

  return (
    <main className="section-padding">
      <div className="container-app">
        <p className="eyebrow mb-2">Our Services</p>
        <h1 className="text-4xl font-display font-bold mb-8">
          What we offer
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/services/${cat.slug}`}
              className="service-card group"
            >
              <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-accent-500 transition-colors">
                {cat.name}
              </h3>
              <p className="text-neutral-500 text-sm">{cat.description}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}

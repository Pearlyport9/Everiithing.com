export default function ServiceCategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const categoryName = params.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <main className="pt-6 pb-24 md:pt-20 lg:pt-28 px-20">
      <div className="container-app">
        <p className="eyebrow mb-2">Services</p>
        <h1 className="text-4xl font-display font-bold mb-8">
          {categoryName}
        </h1>
        <p className="text-neutral-500 mb-8">
          Browse available {categoryName.toLowerCase()} services and book a
          verified provider.
        </p>
        <a href="/dashboard/book" className="btn-primary inline-block">
          Book Now
        </a>
      </div>
    </main>
  )
}

interface ServiceCardProps {
  name: string
  slug: string
  description: string
}

export function ServiceCard({ name, slug, description }: ServiceCardProps) {
  return (
    <a href={`/services/${slug}`} className="service-card group block">
      <h3 className="text-xl font-display font-semibold mb-2 group-hover:text-accent-500 transition-colors">
        {name}
      </h3>
      <p className="text-neutral-500 text-sm">{description}</p>
    </a>
  )
}

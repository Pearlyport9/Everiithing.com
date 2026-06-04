interface ProviderCardProps {
  name: string
  rating: number
  category: string
  lga: string
  totalJobs: number
}

export function ProviderCard({ name, rating, category, lga, totalJobs }: ProviderCardProps) {
  return (
    <div className="service-card">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-neutral-500">
          {name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <span className="verified-badge">Verified</span>
        </div>
      </div>
      <div className="text-sm text-neutral-500 space-y-1">
        <p>{category}</p>
        <p>Serves: {lga}</p>
        <p>{totalJobs} jobs completed</p>
      </div>
    </div>
  )
}

import { Briefcase } from 'lucide-react'

export default function ProviderJobsPage() {
  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 4px 24px rgba(13, 16, 33, 0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            My Jobs
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            View and manage your assigned service jobs
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8 md:py-16">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--color-primaryContainer)' }}
        >
          <Briefcase size={28} style={{ color: 'var(--color-primary)' }} />
        </div>
        <p className="font-display font-semibold text-lg" style={{ color: 'var(--color-onSurface)' }}>
          No jobs yet
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
          When customers book your services, jobs will appear here.
        </p>
      </div>
    </div>
  )
}

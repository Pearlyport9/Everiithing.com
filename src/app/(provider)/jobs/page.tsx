import { Briefcase } from 'lucide-react'

export default function ProviderJobsPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-navy-900 mb-8">
        My Jobs
      </h1>

      <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-100 text-center">
        <Briefcase size={48} className="mx-auto text-neutral-300 mb-4" />
        <h2 className="text-lg font-display font-semibold text-navy-900 mb-2">
          No jobs yet
        </h2>
        <p className="text-neutral-500 text-sm">
          When customers book your services, jobs will appear here.
        </p>
      </div>
    </div>
  )
}

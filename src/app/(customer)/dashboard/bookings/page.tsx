import { CalendarCheck } from 'lucide-react'

export default function BookingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-navy-900 mb-8">
        My Bookings
      </h1>

      <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-100 text-center">
        <CalendarCheck size={48} className="mx-auto text-neutral-300 mb-4" />
        <h2 className="text-lg font-display font-semibold text-navy-900 mb-2">
          No bookings yet
        </h2>
        <p className="text-neutral-500 text-sm mb-6">
          When you book a service, your bookings will appear here.
        </p>
        <a href="/dashboard/book" className="btn-primary inline-block">
          Book a Service
        </a>
      </div>
    </div>
  )
}

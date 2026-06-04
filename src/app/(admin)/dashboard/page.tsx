export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Providers', value: '0' },
          { label: 'Pending Verification', value: '0' },
          { label: 'Active Bookings', value: '0' },
          { label: 'Open Disputes', value: '0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-neutral-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

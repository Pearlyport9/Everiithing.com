export default function CustomerDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold mb-6">My Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="service-card">
          <h3 className="font-semibold mb-2">Active Bookings</h3>
          <p className="text-3xl font-bold text-accent-500">0</p>
        </div>
        <div className="service-card">
          <h3 className="font-semibold mb-2">Completed Jobs</h3>
          <p className="text-3xl font-bold text-success">0</p>
        </div>
        <div className="service-card">
          <h3 className="font-semibold mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-navy-900">&#8358;0</p>
        </div>
      </div>
    </div>
  )
}

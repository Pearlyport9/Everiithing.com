export default function ProviderDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display font-bold mb-6">Provider Home</h1>
      <div className="bg-warning/10 border border-warning rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-warning">
          Your profile is pending verification. We&apos;ll review your
          application within 48 hours.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="service-card">
          <h3 className="text-neutral-500 text-sm mb-1">Available Balance</h3>
          <p className="text-2xl font-bold">&#8358;0</p>
        </div>
        <div className="service-card">
          <h3 className="text-neutral-500 text-sm mb-1">Total Earnings</h3>
          <p className="text-2xl font-bold">&#8358;0</p>
        </div>
        <div className="service-card">
          <h3 className="text-neutral-500 text-sm mb-1">Rating</h3>
          <p className="text-2xl font-bold">\u2014</p>
        </div>
      </div>
    </div>
  )
}

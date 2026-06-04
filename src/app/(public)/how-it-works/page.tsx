export default function HowItWorksPage() {
  const steps = [
    { title: 'Choose a Service', description: 'Browse our 7 categories and select what you need done.' },
    { title: 'Book & Pay Securely', description: 'Pick a time, confirm your address, and pay securely through Flutterwave.' },
    { title: 'Get It Done', description: 'A verified provider arrives at your door. Job complete or your money back.' },
  ]

  return (
    <main className="section-padding">
      <div className="container-app max-w-3xl">
        <p className="eyebrow text-center mb-2">How It Works</p>
        <h1 className="text-4xl font-display font-bold text-center mb-12">
          Three simple steps
        </h1>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-xl shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold mb-1">
                  {step.title}
                </h3>
                <p className="text-neutral-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

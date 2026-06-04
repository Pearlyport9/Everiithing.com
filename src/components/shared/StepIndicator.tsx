interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              i <= currentStep
                ? 'bg-accent-500 text-white'
                : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 ${
                i < currentStep ? 'bg-accent-500' : 'bg-neutral-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

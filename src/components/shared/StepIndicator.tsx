import { Check } from 'lucide-react'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-6 md:mb-10 overflow-x-auto px-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center min-w-0">
            <div
              className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center text-[11px] md:text-sm font-bold transition-all duration-base shrink-0 ${
                i < currentStep
                  ? 'bg-[--md-primary-container] text-[--md-primary]'
                  : i === currentStep
                  ? 'bg-[--md-primary] text-white'
                  : 'bg-[--md-surface-variant] text-[--md-on-surface-variant]'
              }`}
            >
              {i < currentStep ? (
                <Check className="w-3.5 h-3.5 md:w-5 md:h-5" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`mt-1 md:mt-2 text-[10px] md:text-xs whitespace-nowrap ${
                i === currentStep
                  ? 'text-[--md-on-surface] font-semibold'
                  : 'text-[--md-on-surface-variant]'
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-4 md:w-16 h-0.5 mx-1 md:mx-3 ${i < currentStep ? 'bg-[--md-primary]' : 'bg-[--md-outline-variant]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

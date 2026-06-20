'use client'

import { useEffect, useRef, useState } from 'react'

interface StepProps {
  number: number
  title: string
  description: string
  delay: number
  icon: React.ReactNode
}

export function HowItWorksStep({ number, title, description, delay, icon }: StepProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 500ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {/* ---- Mobile / Tablet Card Layout ---- */}
      <div className="lg:hidden rounded-2xl p-5 shadow-sm" style={{ backgroundColor: 'white' }}>
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: 'var(--md-tertiary)' }}>
            {icon}
          </div>
        </div>
        <h3 className="text-center font-bold text-base mt-3" style={{ color: 'var(--md-on-surface)' }}>
          {title}
        </h3>
        <p className="text-center text-sm mt-1 line-clamp-3" style={{ color: 'var(--md-on-surface-variant)' }}>
          {description}
        </p>
      </div>

      {/* ---- Desktop Layout ---- */}
      <div className="hidden lg:flex lg:flex-col lg:items-center lg:text-center">
        {/* Custom Circle Indicator */}
        <div className="relative flex items-center justify-center" style={{ width: '88px', height: '88px' }}>
          {/* Outer circle — glassmorphism fill */}
          <div
            className="absolute rounded-full"
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: 'var(--md-tertiary)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
            }}
          />

          {/* Inner circle — glassmorphism fill */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--md-tertiary)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(158, 46, 26, 0.25)',
            }}
          >
            <span
              className="relative z-10 font-display font-bold text-xl"
              style={{ color: 'var(--md-on-tertiary)' }}
            >
              {number}
            </span>
          </div>
        </div>

        <h3 className="font-display font-semibold mt-5" style={{ fontSize: '18px', color: 'var(--md-on-surface)' }}>
          {title}
        </h3>
        <p
          className="mt-2 leading-relaxed"
          style={{ fontSize: '14px', color: 'var(--md-on-surface-variant)', maxWidth: '220px' }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

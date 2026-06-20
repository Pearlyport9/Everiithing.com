'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedStatProps {
  value: number
  suffix: string
  label: string
  shortLabel?: string
}

export function AnimatedStat({ value, suffix, label, shortLabel }: AnimatedStatProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const duration = 1500
          const steps = 60
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(current)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  const display = Number.isInteger(value) ? Math.floor(count) : count.toFixed(1)

  return (
    <div ref={ref} className="text-left">
      <p className="font-display font-extrabold leading-none" style={{ fontSize: 'clamp(1.25rem, 3vw, 3rem)', color: 'var(--md-on-surface)' }}>
        {display}{suffix}
      </p>
      <p className="text-[10px] md:text-xs font-semibold tracking-[0.1em] mt-1 uppercase" style={{ color: 'var(--md-on-surface-variant)' }}>
        <span className="hidden md:inline">{label}</span>
        {shortLabel && <span className="md:hidden">{shortLabel}</span>}
        {!shortLabel && <span className="md:hidden">{label}</span>}
      </p>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    step: 1,
    label: 'Step 1',
    heading: 'Book a Call-Out',
    description:
      'Choose your service and pay a flat call-out fee. A verified provider will come to your location to assess the job, no commitment yet, just an honest look.',
  },
  {
    step: 2,
    label: 'Step 2',
    heading: 'Get a Clear Quote',
    description:
      'Your provider assesses the work and sends you a fair, itemised quote. No hidden charges, no surprises. You decide whether to proceed.',
  },
  {
    step: 3,
    label: 'Step 3',
    heading: 'Approve & Pay Securely',
    description:
      'Happy with the quote? Approve it and your payment is held safely in escrow, protected until the job is fully done to your satisfaction.',
  },
  {
    step: 4,
    label: 'Step 4',
    heading: 'Job Done, Payment Released',
    description:
      'Once the job is complete and you\'re satisfied, payment is released to the provider. If anything goes wrong, your money is protected.',
  },
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [ctaVisible, setCtaVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-step'))
            if (!isNaN(idx)) setActiveStep(idx)
          }
        }
      },
      { threshold: 0.4 }
    )

    for (const el of stepRefs.current) {
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setCtaVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target === ctaRef.current) {
            setCtaVisible(true)
          }
        }
      },
      { threshold: 0.15 }
    )

    if (ctaRef.current) observer.observe(ctaRef.current)

    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <>
      {/* ─── SECTION HEADER ─── */}
      <section className="pt-6 pb-6 max-lg:pb-6 md:pt-20 lg:pt-28 lg:pb-16" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-display font-extrabold leading-[1.1] max-w-3xl mx-auto"
            style={{ color: 'var(--md-on-background)' }}
          >
            Safe, simple, and guaranteed
          </h1>
          <p
            className="text-base md:text-lg mt-2 max-md:mt-1 mx-auto leading-relaxed max-md:leading-none"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            <span className="lg:hidden">Click. Book. Done.</span>
            <span className="hidden lg:inline">From first click to job done, guaranteed</span>
          </p>
        </div>
      </section>

      {/* ─── MAIN TWO-COLUMN LAYOUT ─── */}
      <section className="pb-12 md:pb-20" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12">

            {/* LEFT — Sticky Image */}
            <div className="lg:col-span-5">
              <div
                className="lg:sticky rounded-2xl overflow-hidden relative max-lg:h-96 lg:min-h-[520px] lg:h-[calc(100vh-120px)] lg:top-20 opacity-100"
                style={{
                  transition: 'opacity 450ms ease-out, transform 450ms ease-out',
                }}
              >
                <Image
                  src="/Test%202%20pic.svg"
                  alt="A verified Everiithing provider at work"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* RIGHT — Scrolling Steps */}
            <div className="lg:col-span-7 lg:pl-4">
              <div className="space-y-0">
                {steps.map((step, idx) => {
                  const isActive = idx === activeStep
                  return (
                    <div key={step.step}>
                      <div
                        ref={(el) => { stepRefs.current[idx] = el }}
                        data-step={idx}
                        style={{
                          opacity: 1,
                          transform: 'none',
                          transition: `opacity 450ms ease-out ${70 * idx}ms, transform 450ms ease-out ${70 * idx}ms`,
                        }}
                      >
                        <span
                          className="block text-xs font-semibold tracking-widest uppercase max-lg:mt-6"
                          style={{
                            color: isActive ? 'var(--md-tertiary)' : 'var(--md-on-surface-variant)',
                            transition: 'color 200ms ease',
                          }}
                        >
                          {step.label}
                        </span>

                        <h2
                          className="text-xl md:text-3xl font-display font-bold mt-2 mb-3"
                          style={{
                            color: isActive ? 'var(--md-primary)' : 'var(--md-on-surface)',
                            transition: 'color 200ms ease',
                          }}
                        >
                          {step.heading}
                        </h2>

                        <p
                          className="text-base leading-relaxed"
                          style={{
                            color: 'var(--md-on-surface-variant)',
                            maxWidth: '520px',
                          }}
                        >
                          {step.description}
                        </p>
                      </div>

                      {idx < steps.length - 1 && (
                        <hr
                          className="my-4 md:my-12"
                          style={{ borderColor: 'var(--md-outline-variant)' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ─── CTA ROW ─── */}
              <div
                className="mt-10"
                style={{
                  opacity: 1,
                  transform: 'none',
                  transition: `opacity 450ms ease-out ${70 * steps.length}ms, transform 450ms ease-out ${70 * steps.length}ms`,
                }}
              >
                <hr className="mb-6" style={{ borderColor: 'var(--md-outline-variant)' }} />
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/dashboard/book"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                  >
                    Book a Call-Out <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section
        ref={ctaRef}
        className="relative pt-14 pb-16 md:py-20 flex items-center justify-center overflow-hidden bg-[var(--md-primary)]"
        style={reducedMotion ? {} : {
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 450ms ease-out, transform 450ms ease-out',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/images/everiithing/cta-bg.png)' }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--md-on-background)', opacity: 0.78 }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold text-white leading-tight">
            Stop Gambling with Your Home
          </h2>
          <p className="text-white/80 text-sm md:text-base mt-2 mx-auto" style={{ maxWidth: '480px' }}>
            <span className="md:hidden">Verified pros, zero stress.</span>
            <span className="hidden md:inline">Verified pros, transparent pricing, guaranteed results, zero stress.</span>
          </p>
          <div className="flex flex-col items-center gap-3 mt-6 max-w-xs mx-auto">
            <Link
              href="/dashboard/book"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
            >
              Book a Service <ArrowRight size={18} />
            </Link>
            <Link
              href="/become-a-provider"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border-2 border-white"
              style={{ color: 'white', backgroundColor: 'transparent' }}
            >
              Join as a Provider
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

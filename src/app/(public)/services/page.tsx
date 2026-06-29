'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Wrench, Zap, Wind, Battery, PaintBucket, Sparkles, Hammer } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const categories = [
  { name: 'Plumbing', slug: 'plumbing', description: 'Fixing leaks, pipes, and water systems' },
  { name: 'Electrical', slug: 'electrical', description: 'Wiring, switches, and electrical repairs' },
  { name: 'AC Services', slug: 'ac-services', description: 'Installation, repair, and servicing' },
  { name: 'Generator, Inverter & Solar', slug: 'generator-inverter', description: 'Repair and maintenance' },
  { name: 'Painting', slug: 'painting', description: 'Interior and exterior painting' },
    { name: 'Deep Cleaning', slug: 'deep-cleaning', description: 'Professional home & office cleaning' },
  { name: 'Carpentry', slug: 'carpentry', description: 'Furniture, shelves, and woodwork' },
]

const categoryIcons: Record<string, React.ElementType> = {
  plumbing: Wrench,
  electrical: Zap,
  'ac-services': Wind,
  'generator-inverter': Battery,
  painting: PaintBucket,
  'deep-cleaning': Sparkles,
  carpentry: Hammer,
}

export default function ServicesPage() {
  const [gridVisible, setGridVisible] = useState(false)
  const [calloutVisible, setCalloutVisible] = useState(false)
  const [ctaVisible, setCtaVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const calloutRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setGridVisible(true)
      setCalloutVisible(true)
      setCtaVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (entry.target === gridRef.current) setGridVisible(true)
            if (entry.target === calloutRef.current) setCalloutVisible(true)
            if (entry.target === ctaRef.current) setCtaVisible(true)
          }
        }
      },
      { threshold: 0.15 }
    )

    if (gridRef.current) observer.observe(gridRef.current)
    if (calloutRef.current) observer.observe(calloutRef.current)
    if (ctaRef.current) observer.observe(ctaRef.current)

    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <>
    <section className="pt-6 pb-12 md:pt-20 lg:pt-28 lg:pb-20" style={{ backgroundColor: 'var(--md-surface)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">

        {/* Section Header */}
        <div className="text-center mb-4 lg:mb-12">
          <h1
            className="text-4xl md:text-5xl font-display font-extrabold leading-none"
            style={{ color: 'var(--md-on-background)' }}
          >
            Home & office services
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed mt-2 mx-auto"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            <span className="lg:hidden">Trusted pros, every time.</span>
            <span className="hidden lg:inline">Every home & office needs a trusted pro</span>
          </p>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — Service Card Grid */}
          <div ref={gridRef} className="lg:col-span-8">
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, idx) => {
                const Icon = categoryIcons[cat.slug]
                const isLast = idx === categories.length - 1
                const cardStyle: React.CSSProperties = reducedMotion
                  ? {}
                  : {
                      opacity: gridVisible ? 1 : 0,
                      transform: gridVisible ? 'translateX(0)' : 'translateX(-35px)',
                      transition: `opacity 450ms ease-out, transform 450ms ease-out`,
                      transitionDelay: gridVisible ? `${idx * 70}ms` : '0ms',
                    }
                return (
                  <Card key={cat.slug} className={`h-full border-0 cursor-pointer motion-safe:hover:-translate-y-1 transition-[transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-token-tertiary max-[1024px]:!p-[16px_12px] ${isLast ? 'col-span-2' : ''}`} hover={false} style={cardStyle}>
                    <div className="flex flex-col items-start max-[1024px]:gap-2 gap-3">
                      <div
                        className="max-[1024px]:w-10 max-[1024px]:h-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--md-tertiary)' }}
                      >
                        {Icon && <Icon size={20} style={{ color: 'var(--md-on-tertiary)' }} />}
                      </div>
                      <h2 className="max-[1024px]:text-sm text-lg font-display font-bold" style={{ color: 'var(--md-on-surface)' }}>
                        {cat.name}
                      </h2>
                      <p className="max-[1024px]:text-xs max-[1024px]:line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--md-on-surface-variant)' }}>
                        {cat.description}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* RIGHT — Highlighted Callout Card */}
          <div ref={calloutRef} className="lg:col-span-4">
            <div
              className="rounded-xl overflow-hidden h-full flex flex-col relative max-[430px]:min-h-[280px] min-h-[380px]"
              style={reducedMotion ? {} : {
                opacity: calloutVisible ? 1 : 0,
                transform: calloutVisible ? 'translateX(0)' : 'translateX(35px)',
                transition: 'opacity 450ms ease-out, transform 450ms ease-out',
                transitionDelay: calloutVisible ? '70ms' : '0ms',
              }}
            >
              <Image
                src="/images/everiithing/PIC%205%20SVG.svg"
                alt=""
                fill
                className="object-cover"
              />
              <div className="relative z-10 p-6 flex flex-col justify-end flex-1 pb-8">
                <div>
                  <Link
                    href="/dashboard/book"
                    className="inline-flex max-lg:flex max-[430px]:inline-flex items-center justify-center gap-2 w-full max-lg:w-fit max-lg:mx-auto max-[430px]:w-full max-[430px]:mx-0 px-7 py-3 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
                    style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                  >
                    Book a Call-Out <ArrowRight size={18} />
                  </Link>
                </div>
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
            End the Home & Office Gamble
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

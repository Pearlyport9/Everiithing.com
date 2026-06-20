'use client'

import { useState, useEffect, useRef } from 'react'

const testimonials = [
  {
    quote: 'Professional plumber, fixed our burst pipe in under an hour. Never going back to random referrals.',
    name: 'Adaeze Okonkwo',
    title: 'Victoria Island, Lagos',
    rating: 5,
  },
  {
    quote: 'The electrician was verified and showed up on time. Price you see is what you pay — no hidden charges.',
    name: 'Emeka Nwosu',
    title: 'Lekki Phase 1, Lagos',
    rating: 5,
  },
  {
    quote: 'Deep cleaning left my apartment spotless. The team was thorough, polite, and the guarantee is real.',
    name: 'Funke Adeleke',
    title: 'Ikeja, Lagos',
    rating: 5,
  },
  {
    quote: 'Generator fixed same day. Knowing he was vetted and skills-tested gave me real confidence.',
    name: 'Chukwudi Eze',
    title: 'Yaba, Lagos',
    rating: 5,
  },
  {
    quote: 'Clean finish, no mess. The flat-rate pricing meant I knew the cost before he arrived.',
    name: 'Blessing Osei',
    title: 'Surulere, Lagos',
    rating: 5,
  },
]

const doubled = [...testimonials, ...testimonials]

function Star({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'var(--md-secondary-container)' }}>
      <path d="M8 0.5L10.245 5.615L16 6.32L11.715 10.295L12.73 16L8 13.25L3.27 16L4.285 10.295L0 6.32L5.755 5.615L8 0.5Z" />
    </svg>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('')

  return (
    <div
      style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14,
        background: 'var(--md-tertiary)',
        color: 'var(--md-on-tertiary)',
      }}
    >
      {initials}
    </div>
  )
}

export default function TestimonialsMarquee() {
  const [visible, setVisible] = useState(false)
  const [marqueeRunning, setMarqueeRunning] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    setIsCompact(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsCompact(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          setVisible(true)
          // Start marquee after fade-in completes (500ms + stagger)
          setTimeout(() => setMarqueeRunning(true), 600 + testimonials.length * 100)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        paddingTop: 80,
        paddingBottom: 48,
        background: 'var(--md-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: 24, paddingRight: 24, marginBottom: 48 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold" style={{ color: 'var(--md-on-surface)' }}>
            What Our Happy Clients Say
          </h2>
          <p style={{ marginTop: 8, fontSize: 15, color: 'var(--md-on-surface-variant)', lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            <span className="lg:hidden">Real stories, real results.</span>
            <span className="hidden lg:inline">Real people, real results hear it from them.</span>
          </p>
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        <div
          className={marqueeRunning ? 'marquee-track' : ''}
          onMouseEnter={() => setMarqueeRunning(false)}
          onMouseLeave={() => {
            if (hasAnimated.current) setMarqueeRunning(true)
          }}
          style={{
            display: 'flex',
            gap: 24,
            width: 'max-content',
            animationPlayState: marqueeRunning ? 'running' : 'paused',
          }}
        >
          {doubled.map((t, i) => (
            <div
              key={i}
              style={{
                width: 320,
                flexShrink: 0,
                padding: isCompact ? '12px 16px' : 28,
                background: 'var(--color-surfaceContainerLow)',

                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 250ms ease',
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                opacity: visible ? 1 : 0,
                transitionDelay: visible ? `${(i % testimonials.length) * 100}ms` : '0ms',
                transitionProperty: 'opacity, transform, box-shadow',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: isCompact ? 8 : 16 }}>
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} size={isCompact ? 12 : 16} />
                ))}
              </div>

              {/* Review text */}
              <p
                style={{
                  fontSize: isCompact ? 13 : 14,
                  lineHeight: 1.7,
                  color: 'var(--md-on-surface-variant)',
                  marginBottom: isCompact ? 8 : 24,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Reviewer row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? 8 : 12 }}>
                <Avatar name={t.name} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: isCompact ? 12 : 14, color: 'var(--md-on-surface)' }}>
                    {t.name}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--md-on-surface-variant)', marginTop: 2 }}>
                    {t.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee ${isCompact ? '60s' : '35s'} linear infinite;
        }
      `}</style>
    </section>
  )
}

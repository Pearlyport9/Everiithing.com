'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ArrowRight } from 'lucide-react'

const categories = [
  {
    id: 'pricing',
    label: 'Pricing & Payments',
    questions: [
      {
        q: 'What is the call-out fee?',
        a: 'The call-out fee is a flat \u20A65,000 charged when you book any service. It covers the cost of sending a verified provider to your location to assess the job. You pay this upfront \u2014 no matter the service category, the fee is always the same.',
      },
      {
        q: 'When do I pay the full job amount?',
        a: 'After your provider assesses the job, they send you a quote for the total cost. You only pay the remaining balance if you approve the quote. There is no pressure to proceed \u2014 the call-out fee is the only commitment upfront.',
      },
      {
        q: 'How does escrow protect my payment?',
        a: 'Once you approve a quote and make payment, your money is held securely in escrow \u2014 it is not released to the provider until the job is completed to your satisfaction. This means your money is always protected.',
      },
      {
        q: 'Are there any hidden fees?',
        a: 'None. The call-out fee is \u20A65,000, flat, for every service. The only other amount you pay is the quote your provider gives you, which you must approve before paying. No surprises.',
      },
      {
        q: 'What happens if I pay and the job isn\u2019t done?',
        a: 'Your payment stays in escrow until you confirm the job is complete. If the work isn\u2019t done or you\u2019re not satisfied, contact us directly and we will resolve it before any payment is released.',
      },
    ],
  },
  {
    id: 'bookings',
    label: 'Bookings',
    questions: [
      {
        q: 'How do I book a service?',
        a: 'Choose your service category, pick a date and time, and pay the flat \u20A65,000 call-out fee. We assign a verified provider to your booking and they come to assess the job. It takes less than 3 minutes to book.',
      },
      {
        q: 'Can I cancel after booking?',
        a: 'Yes. Contact us as soon as possible if you need to cancel. Cancellation terms depend on how close to the scheduled time you cancel \u2014 reach out and we will work it out with you.',
      },
      {
        q: 'How long does it take to get a provider?',
        a: 'We aim to assign a verified provider within 24 hours of your booking. You will receive a confirmation once a provider is assigned.',
      },
      {
        q: 'What areas do you currently cover?',
        a: 'We currently operate in Lagos, Nigeria. We are expanding to more cities soon.',
      },
      {
        q: 'Can I reschedule my booking?',
        a: 'Yes \u2014 contact us before your scheduled time and we will arrange a new date that works for you and your provider.',
      },
    ],
  },
  {
    id: 'providers',
    label: 'Providers',
    questions: [
      {
        q: 'How are providers verified?',
        a: 'Every provider on Everiithing is manually vetted by our team before they can take any bookings. We check their skills, experience, and background. We do not let just anyone on the platform \u2014 verification is our core quality filter.',
      },
      {
        q: 'What if I am not happy with the work?',
        a: 'Your payment is held in escrow until you are satisfied. If you have a concern, contact us directly and we will review the situation before releasing any funds to the provider.',
      },
      {
        q: 'Can I request a specific provider?',
        a: 'Not yet \u2014 we assign providers based on availability, location, and skill match. This ensures you always get the best person for the job, not just whoever is available.',
      },
      {
        q: 'Are providers employees of Everiithing?',
        a: 'No. Providers are independent professionals who have been verified and approved to work through our platform. We handle booking, payment protection, and quality assurance.',
      },
    ],
  },
  {
    id: 'general',
    label: 'General',
    questions: [
      {
        q: 'What is Everiithing?',
        a: 'Everiithing is a verified home services marketplace for Lagos. We connect homeowners with trusted, vetted professionals for repairs, installations, cleaning, and more \u2014 with escrow payment protection on every job.',
      },
      {
        q: 'How do I contact support?',
        a: 'You can reach us via the contact form on our website or by emailing us directly. We aim to respond within a few hours during business hours.',
      },
      {
        q: 'Is my personal information safe?',
        a: 'Yes. We take data privacy seriously. Your personal information is only used to manage your bookings and is never sold or shared with third parties.',
      },
      {
        q: 'How do I become a provider?',
        a: 'Click \u201cBecome a Provider\u201d in the navigation and fill out our application form. Our team will review your application and get back to you.',
      },
    ],
  },
]

export default function FAQPage() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [activeCategory, setActiveCategory] = useState('pricing')
  const [sectionVisible, setSectionVisible] = useState<boolean[]>(categories.map(() => false))
  const [openQuestions, setOpenQuestions] = useState<{ [catIdx: number]: number | null }>({})
  const [ctaVisible, setCtaVisible] = useState(false)

  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const sectionAnimRefs = useRef<(HTMLElement | null)[]>([])
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
        let best: Element | null = null
        let bestRatio = 0
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            best = entry.target
            bestRatio = entry.intersectionRatio
          }
        }
        if (best) {
          const id = best.getAttribute('data-category')
          if (id) setActiveCategory(id)
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-80px 0px 0px 0px' }
    )

    for (const el of sectionRefs.current) {
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setSectionVisible(categories.map(() => true))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'))
            if (!isNaN(idx)) {
              setSectionVisible((prev) => {
                if (prev[idx]) return prev
                const next = [...prev]
                next[idx] = true
                return next
              })
            }
          }
        }
      },
      { threshold: 0.1 }
    )

    for (const el of sectionAnimRefs.current) {
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [reducedMotion])

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

  const toggleQuestion = (catIdx: number, qIdx: number) => {
    setOpenQuestions((prev) => {
      const current = prev[catIdx] ?? null
      if (current === qIdx) {
        return { ...prev, [catIdx]: null }
      }
      return { ...prev, [catIdx]: qIdx }
    })
  }

  const scrollToCategory = (id: string) => {
    setActiveCategory(id)
    const el = document.getElementById(`faq-${id}`)
    if (el) {
      const headerHeight = 80
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <section className="pt-6 pb-12 md:pt-20 lg:pt-28 md:pb-16" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-display font-extrabold leading-[1.1] max-w-3xl mx-auto"
            style={{
              color: 'var(--md-on-background)',
              opacity: 1,
              transform: 'none',
              transition: 'opacity 450ms ease-out, transform 450ms ease-out',
            }}
          >
            Frequently Asked Questions
          </h1>
          <p
            className="text-base md:text-lg mt-2 mx-auto leading-relaxed max-w-xl"
            style={{
              color: 'var(--md-on-surface-variant)',
              opacity: 1,
              transform: 'none',
              transition: 'opacity 450ms ease-out 100ms, transform 450ms ease-out 100ms',
            }}
          >
            Everything you need to know
          </p>
        </div>
      </section>

      {/* ─── TWO-PANEL LAYOUT ─── */}
      <section className="pb-16 md:pb-24 max-[1024px]:pb-12" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">

            {/* ─── LEFT — STICKY CATEGORY SIDEBAR (Desktop) ─── */}
            <aside
              className="hidden md:block w-full md:w-[240px] lg:w-[280px] flex-shrink-0 self-start"
              style={{
                position: 'sticky',
                top: '88px',
                opacity: 1,
                transform: 'none',
                transition: 'opacity 400ms ease-out 150ms, transform 400ms ease-out 150ms',
              }}
            >
              <div
                className="rounded-xl p-4 space-y-1"
                style={{
                  backgroundColor: 'var(--md-surface-container-low)',
                }}
              >
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => scrollToCategory(cat.id)}
                      className="w-full text-left px-4 py-3 rounded-lg font-display text-sm transition-all duration-200"
                      style={{
                        color: isActive ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
                        fontWeight: isActive ? 600 : 400,
                        backgroundColor: isActive ? 'color-mix(in srgb, var(--md-primary) 8%, transparent)' : 'transparent',
                      }}
                    >
                      {cat.label}
                    </button>
                  )
                })}

                <div className="pl-4 pr-1 pt-3 pb-4 mt-6 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 -ml-2"
                      style={{ backgroundColor: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
                    >
                      ?
                    </span>
                    <h3 className="font-display font-semibold text-sm whitespace-nowrap" style={{ color: 'var(--md-on-surface)' }}>
                      Need help?
                    </h3>
                  </div>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--md-tertiary)',
                      color: 'var(--md-on-tertiary)',
                    }}
                  >
                    Contact Us <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </aside>



            {/* ─── RIGHT — ACCORDION FAQ CONTENT ─── */}
            <div className="flex-1 min-w-0">
              {categories.map((cat, catIdx) => {
                const isVisible = reducedMotion || sectionVisible[catIdx]
                return (
                  <section
                    key={cat.id}
                    id={`faq-${cat.id}`}
                    data-category={cat.id}
                    data-idx={catIdx}
                    className={catIdx > 0 ? 'mt-10 md:mt-12' : ''}
                    ref={(el) => {
                      sectionRefs.current[catIdx] = el
                      sectionAnimRefs.current[catIdx] = el
                    }}
                    style={{
                      opacity: reducedMotion ? 1 : isVisible ? 1 : 0,
                      transform: reducedMotion
                        ? 'none'
                        : isVisible
                          ? 'translateY(0)'
                          : 'translateY(24px)',
                      transition: `opacity 450ms ease-out ${catIdx * 100}ms, transform 450ms ease-out ${catIdx * 100}ms`,
                    }}
                  >
                    <h2
                      className="text-2xl md:text-2xl font-display font-bold mb-3"
                      style={{ color: 'var(--md-on-background)' }}
                    >
                      {cat.label}
                    </h2>

                    <div className="space-y-0">
                      {cat.questions.map((item, qIdx) => {
                        const isOpen = openQuestions[catIdx] === qIdx
                        return (
                          <div key={qIdx}>
                            <button
                              onClick={() => toggleQuestion(catIdx, qIdx)}
                              className="w-full flex items-center justify-between gap-4 py-4 md:py-5 text-left"
                              style={{
                                minHeight: '44px',
                                color: isOpen ? 'var(--md-primary)' : 'var(--md-on-surface)',
                                transition: 'color 200ms ease',
                              }}
                            >
                              <span className="font-display font-medium text-sm md:text-base leading-snug flex-1">
                                {item.q}
                              </span>
                              <ChevronDown
                                size={18}
                                className="flex-shrink-0 transition-transform duration-250"
                                style={{
                                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  color: isOpen ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
                                  transition: 'transform 250ms ease, color 200ms ease',
                                }}
                              />
                            </button>

                            <div
                              className="overflow-hidden transition-all duration-250 ease-out"
                              style={{
                                maxHeight: isOpen ? '500px' : '0px',
                                opacity: isOpen ? 1 : 0,
                                transition: 'max-height 250ms ease, opacity 250ms ease',
                              }}
                            >
                              <p
                                className="pb-4 md:pb-5 text-sm md:text-base leading-relaxed"
                                style={{ color: 'var(--md-on-surface-variant)' }}
                              >
                                {item.a}
                              </p>
                            </div>

                            <hr style={{ borderColor: 'var(--md-outline-variant)' }} />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}

              <div className="md:hidden flex items-center gap-3 pr-1 pb-2 max-[1024px]:mt-6">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 -ml-2"
                    style={{ backgroundColor: 'var(--md-primary)', color: 'var(--md-on-primary)' }}
                  >
                    ?
                  </span>
                  <h3 className="font-display font-semibold text-sm whitespace-nowrap" style={{ color: 'var(--md-on-surface)' }}>
                    Need help?
                  </h3>
                </div>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--md-tertiary)',
                    color: 'var(--md-on-tertiary)',
                  }}
                >
                  Contact Us <ArrowRight size={14} />
                </a>
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

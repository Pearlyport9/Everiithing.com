'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const collageImages = [
  { src: '/Test%201%20pic.svg', alt: 'Home service professional' },
  { src: '/Test%202%20pic.svg', alt: 'Provider at work' },
  { src: '/Test%203%20pic.svg', alt: 'Service in progress' },
  { src: '/Test%204%20pic.svg', alt: 'Provider on site' },
]

const heights = [260, 320, 280, 240]

export default function AboutPage() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [missionVisible, setMissionVisible] = useState(false)
  const [storyVisible, setStoryVisible] = useState(false)
  const [bar1Filled, setBar1Filled] = useState(false)
  const [bar2Filled, setBar2Filled] = useState(false)
  const [bar3Filled, setBar3Filled] = useState(false)
  const [valuesVisible, setValuesVisible] = useState(false)

  const missionRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setMissionVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target === missionRef.current) {
            setMissionVisible(true)
          }
        }
      },
      { threshold: 0.15 }
    )

    if (missionRef.current) observer.observe(missionRef.current)

    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) {
      setStoryVisible(true)
      setBar1Filled(true)
      setBar2Filled(true)
      setBar3Filled(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target === storyRef.current) {
            setStoryVisible(true)
            setTimeout(() => setBar1Filled(true), 200)
            setTimeout(() => setBar2Filled(true), 350)
            setTimeout(() => setBar3Filled(true), 500)
          }
        }
      },
      { threshold: 0.15 }
    )

    if (storyRef.current) observer.observe(storyRef.current)
    return () => observer.disconnect()
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) {
      setValuesVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target === valuesRef.current) {
            setValuesVisible(true)
          }
        }
      },
      { threshold: 0.15 }
    )

    if (valuesRef.current) observer.observe(valuesRef.current)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <>
      {/* ─── PAGE HEADER ─── */}
      <section className="pt-6 pb-10 md:pt-20 lg:pt-28 md:pb-14" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-display font-extrabold leading-[1.1]"
            style={{
              color: 'var(--md-on-background)',
              opacity: 1,
              transform: 'none',
              transition: 'opacity 450ms ease-out, transform 450ms ease-out',
            }}
          >
            About Us
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
            <span className="lg:hidden">Lagos&apos;s trusted marketplace.</span>
            <span className="hidden lg:inline">The story behind Lagos&apos;s most trusted home services marketplace</span>
          </p>
        </div>
      </section>

      {/* ─── STAGGERED IMAGE COLLAGE ROW ─── */}
      <section className="pb-6 lg:pb-16" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Desktop collage */}
          <div className="hidden md:flex items-end gap-3 md:gap-4">
            {collageImages.map((img, idx) => (
              <div
                key={img.src}
                className="relative flex-shrink-0 flex-1 rounded-xl overflow-hidden"
                style={{
                  height: `${heights[idx]}px`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  opacity: 1,
                  transform: 'none',
                  transition: `opacity 400ms ease-out ${70 * idx}ms, transform 400ms ease-out ${70 * idx}ms`,
                }}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* Mobile collage — horizontal scroll */}
          <div className="md:hidden -mx-6 px-6 overflow-x-auto scrollable-x [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-3 pb-2">
              {collageImages.map((img, idx) => (
                <div
                  key={img.src}
                  className="relative w-[220px] h-[200px] flex-shrink-0 rounded-xl overflow-hidden"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    opacity: 1,
                    transform: 'none',
                    transition: `opacity 400ms ease-out ${70 * idx}ms, transform 400ms ease-out ${70 * idx}ms`,
                  }}
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MISSION STATEMENT ─── */}
      <section className="max-md:pb-0 md:pb-28" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div
            ref={missionRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-[104px] md:gap-12 items-stretch"
          >
            {/* Left — Mission text */}
            <div
              className="flex flex-col"
              style={{
                opacity: reducedMotion ? 1 : missionVisible ? 1 : 0,
                transform: reducedMotion
                  ? 'none'
                  : missionVisible
                    ? 'translateX(0)'
                    : 'translateX(-20px)',
                transition: 'opacity 450ms ease-out, transform 450ms ease-out',
              }}
            >
              <div>
                <h2
                className="text-3xl md:text-4xl font-display font-bold max-md:leading-[1.0] leading-[1.15]"
                  style={{ color: 'var(--md-on-background)' }}
                >
                  Building Lagos&apos;s most<br />trusted home services marketplace
                </h2>
                <p
                  className="text-base md:text-lg leading-relaxed mt-2"
                  style={{ color: 'var(--md-on-surface-variant)', maxWidth: '520px' }}
                >
                  Every provider is verified, every payment is protected, and every job comes with a guarantee. We&rsquo;re here to take the risk out of finding help at home, so you can focus on what matters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                  href="/dashboard/book"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                >
                  Book a Service <ArrowRight size={18} />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border"
                  style={{ borderColor: 'var(--md-outline)', color: 'var(--md-on-surface)', backgroundColor: 'transparent' }}
                >
                  How It Works
                </Link>
              </div>
            </div>

            {/* Right — Image */}
            <div
              className="rounded-xl w-full h-[300px] md:h-full overflow-hidden relative md:min-h-[420px]"
              style={{
                opacity: reducedMotion ? 1 : missionVisible ? 1 : 0,
                transform: reducedMotion
                  ? 'none'
                  : missionVisible
                    ? 'translateX(0)'
                    : 'translateX(20px)',
                transition: 'opacity 450ms ease-out 100ms, transform 450ms ease-out 100ms',
              }}
            >
              <Image src="/images/everiithing/PIC%203%20SVG.svg" alt="Cleaning professional at work" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STORY + PROGRESS BARS ─── */}
      <section ref={storyRef} className="max-md:pt-0 pb-20 lg:py-20" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            <div
              className="w-full lg:w-[45%]"
              style={{
                opacity: reducedMotion ? 1 : storyVisible ? 1 : 0,
                transform: reducedMotion ? 'none' : storyVisible ? 'translateX(0)' : 'translateX(-30px)',
                transition: 'opacity 450ms ease-out, transform 450ms ease-out',
              }}
            >
              <div className="hidden gap-3">
                <div className="flex-1 h-[180px] rounded-xl overflow-hidden relative">
                  <Image src="/images/everiithing/PIC%201%20SVG.svg" alt="Plumbing professional at work" fill className="object-cover" />
                </div>
                <div className="flex-1 h-[180px] rounded-xl overflow-hidden relative">
                  <Image src="/images/everiithing/PIC%202%20SVG.svg" alt="AC technician on site" fill className="object-cover" />
                </div>
              </div>
              <div className="hidden lg:flex lg:flex-col gap-4">
                <div className="w-full h-[220px] rounded-xl overflow-hidden relative">
                  <Image src="/images/everiithing/PIC%201%20SVG.svg" alt="Plumbing professional at work" fill className="object-cover" />
                </div>
                <div className="w-full h-[280px] rounded-xl overflow-hidden relative">
                  <Image src="/images/everiithing/PIC%202%20SVG.svg" alt="AC technician on site" fill className="object-cover" />
                </div>
              </div>
            </div>

            <div
              className="w-full lg:w-[55%] space-y-2"
              style={{
                opacity: reducedMotion ? 1 : storyVisible ? 1 : 0,
                transform: reducedMotion ? 'none' : storyVisible ? 'translateX(0)' : 'translateX(30px)',
                transition: 'opacity 450ms ease-out, transform 450ms ease-out',
              }}
            >
              <h2
                className="text-3xl md:text-4xl font-display font-bold leading-[1.15]"
                style={{ color: 'var(--md-on-surface)' }}
              >
                Redefining home services<br />in Lagos
              </h2>

              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: 'var(--md-on-surface-variant)', maxWidth: '500px' }}
              >
                Finding a trustworthy artisan in Lagos shouldn&apos;t feel like a gamble. We built Everiithing because homeowners deserve better: verified professionals, transparent pricing, and the peace of mind that comes with knowing your payment is protected until the job is done right.
                </p>

              <div className="space-y-5 pt-2">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--md-on-surface)' }}>Provider Verification Rate</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--md-primary)' }}>100%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--md-surface-variant)' }}>
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: reducedMotion || bar1Filled ? '100%' : '0%',
                        backgroundColor: 'var(--md-primary)',
                        transitionDuration: '800ms',
                        transitionDelay: '0ms',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--md-on-surface)' }}>Escrow Payment Protection</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--md-primary)' }}>100%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--md-surface-variant)' }}>
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: reducedMotion || bar2Filled ? '100%' : '0%',
                        backgroundColor: 'var(--md-primary)',
                        transitionDuration: '800ms',
                        transitionDelay: '0ms',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold" style={{ color: 'var(--md-on-surface)' }}>Satisfaction Guarantee</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--md-primary)' }}>100%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--md-surface-variant)' }}>
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: reducedMotion || bar3Filled ? '100%' : '0%',
                        backgroundColor: 'var(--md-primary)',
                        transitionDuration: '800ms',
                        transitionDelay: '0ms',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/dashboard/book"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97] lg:w-auto w-full justify-center"
                  style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                >
                  Book a Service <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OUR VALUES ─── */}
      <section ref={valuesRef} className="pt-6 pb-12 lg:py-20" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          {/* Header */}
          <div
            className="text-center mb-6 md:mb-16"
            style={{
              opacity: reducedMotion ? 1 : valuesVisible ? 1 : 0,
              transform: reducedMotion ? 'none' : valuesVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 400ms ease-out, transform 400ms ease-out',
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-display font-bold leading-tight"
              style={{ color: 'var(--md-on-surface)' }}
            >
              Standards We Never Compromise
            </h2>
            <p
              className="text-sm md:text-base leading-relaxed mt-2 mx-auto max-md:whitespace-nowrap"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              Commitments behind every booking.
            </p>
          </div>

          {/* Two columns */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-stretch">
            {/* Left — Large Image */}
            <div
              className="w-full lg:w-[40%]"
              style={{
                opacity: reducedMotion ? 1 : valuesVisible ? 1 : 0,
                transform: reducedMotion ? 'none' : valuesVisible ? 'translateX(0)' : 'translateX(-30px)',
                transition: 'opacity 450ms ease-out, transform 450ms ease-out',
              }}
            >
              <div className="relative w-full h-[300px] md:h-full rounded-xl overflow-hidden md:min-h-[420px]">
                <Image src="/images/everiithing/PIC%204%20SVG.svg" alt="Electrical professional at work" fill className="object-cover" />
              </div>
            </div>

            {/* Right — 2x2 Values Grid */}
            <div className="w-full lg:w-[60%] flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-4">
              {[
                {
                  num: '01',
                  title: 'Verified, Always',
                  desc: 'Manually vetted by our team. Skills, experience, and background checked. No shortcuts, ever.',
                },
                {
                  num: '02',
                  title: 'Transparent Pricing',
                  desc: 'See the fee before you book. Approve the quote before you pay. No hidden charges, no surprises.',
                },
                {
                  num: '03',
                  title: 'Your Money is Protected',
                  desc: "Held in escrow until you're satisfied. Your money never reaches the provider until you approve the work.",
                },
                {
                  num: '04',
                  title: 'Quality You Can Trust',
                  desc: 'Every verified provider held to our standard. Every job backed by our guarantee. Quality, always.',
                },
              ].map((v, idx) => (
                <div
                  key={v.num}
                  className="pt-3"
                  style={{
                    opacity: reducedMotion ? 1 : valuesVisible ? 1 : 0,
                    transform: reducedMotion ? 'none' : valuesVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 400ms ease-out ${80 * idx}ms, transform 400ms ease-out ${80 * idx}ms`,
                  }}
                >
                  <p className="text-lg md:text-xl font-bold mb-1" style={{ color: 'var(--md-primary)' }}>{v.num}</p>
                  <h3 className="text-xl md:text-2xl font-display font-bold mb-2" style={{ color: 'var(--md-on-surface)' }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--md-on-surface-variant)' }}>{v.desc}</p>
                </div>
              ))}
             </div>
           </div>
         </div>
       </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="relative pt-14 pb-16 md:py-20 flex items-center justify-center overflow-hidden bg-[var(--md-primary)]">
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

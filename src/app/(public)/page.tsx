import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Star, ChevronRight, Shield, Zap, Users, CalendarCheck, ShieldCheck } from 'lucide-react'
import { AnimatedStat } from '@/components/shared/AnimatedStat'
import { AchievementImageCard } from '@/components/shared/AchievementImageCard'
import { HowItWorksStep } from '@/components/shared/HowItWorksStep'
import ServicesCarousel from '@/components/shared/ServicesCarousel'
import TestimonialsMarquee from '@/components/shared/TestimonialsMarquee'

const services = [
  { name: 'Plumbing', slug: 'plumbing', description: 'Faucets, pipes, water heaters — we fix it all.' },
  { name: 'Electrical', slug: 'electrical', description: 'Wiring, switches, installations by licensed electricians.' },
  { name: 'AC Services', slug: 'ac-services', description: 'Installation, repair & maintenance for all AC units.' },
  { name: 'Generator & Inverter', slug: 'generator-inverter', description: 'Power backup solutions installation & repairs.' },
  { name: 'Painting', slug: 'painting', description: 'Interior & exterior painting for homes and offices.' },
  { name: 'Deep Cleaning', slug: 'deep-cleaning', description: 'Thorough cleaning services for every space.' },
  { name: 'Carpentry', slug: 'carpentry', description: 'Custom furniture, repairs, and woodwork.' },
]

const reasons = [
  { icon: Shield, title: 'Verified Providers', description: 'Every artisan is vetted, interviewed, and skills-tested.' },
  { icon: Zap, title: 'Fast & Reliable', description: 'On-time arrival and guaranteed quality workmanship.' },
  { icon: Users, title: 'Dedicated Support', description: "We're with you from booking to job completion." },
  { icon: Star, title: 'Satisfaction Guaranteed', description: 'Not happy? We will make it right or your money back.' },
]



export default function HomePage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="lg:min-h-screen" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-20 lg:pt-28 pb-12 text-center">
          <h1
            className="text-5xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.1] max-w-4xl mx-auto"
            style={{ color: 'var(--md-on-surface)' }}
          >
            Professional home service<br />you can finally trust
          </h1>

          <p
            className="hidden lg:block text-lg lg:text-xl mx-auto mt-2 leading-relaxed max-w-[530px]"
            style={{ color: 'var(--md-on-surface-variant)' }}
          >
            Book in seconds with transparent flat prices<br />
            <span className="block">and a satisfaction guarantee on every single job.</span>
          </p>

          {/* Trust Strip */}
          <div className="flex items-center justify-center gap-2 md:gap-5 mt-3 md:mt-6 text-xs md:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} style={{ color: 'var(--md-secondary)' }} />
              <span style={{ color: 'var(--md-on-surface-variant)' }}>Verified Providers</span>
            </span>
            <span className="hidden md:inline" style={{ color: 'var(--md-outline)' }}>|</span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <Check size={16} style={{ color: 'var(--md-secondary)' }} />
              <span style={{ color: 'var(--md-on-surface-variant)' }}>Honest Quotes</span>
            </span>
            <span style={{ color: 'var(--md-outline)' }}>|</span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={16} style={{ color: 'var(--md-secondary)' }} />
              <span style={{ color: 'var(--md-on-surface-variant)' }}>Satisfaction Guarantee</span>
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
            <Link
              href="/dashboard/book"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
            >
              Book a Service <ArrowRight size={18} />
            </Link>
            <Link
              href="/become-a-provider"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border"
              style={{ borderColor: 'var(--md-outline)', color: 'var(--md-on-surface)', backgroundColor: 'transparent' }}
            >
              Become a Provider
            </Link>
          </div>
        </div>

        {/* Gallery Strip */}
        <div className="relative overflow-x-auto pb-6 lg:pb-12 scrollable-x [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
          <div className="flex animate-scroll" style={{ gap: '12px', width: 'max-content' }}>
            {[...Array(2)].map((_, groupIdx) => (
              <div key={groupIdx} className="flex" style={{ gap: '12px' }}>
                {[
                  { src: '/images/everiithing/PIC%201%20SVG.svg', alt: 'Plumbing', h: '180px', m: '60px', w: '160px', mh: '120px', mm: '40px', mw: '110px' },
                  { src: '/images/everiithing/PIC%202%20SVG.svg', alt: 'AC repair', h: '260px', m: '20px', w: '220px', mh: '180px', mm: '14px', mw: '150px' },
                  { src: '/images/everiithing/PIC%203%20SVG.svg', alt: 'Cleaning', h: '220px', m: '0px', w: '190px', mh: '150px', mm: '0px', mw: '130px' },
                  { src: '/images/everiithing/PIC%204%20SVG.svg', alt: 'Electrical', h: '160px', m: '80px', w: '210px', mh: '110px', mm: '55px', mw: '140px' },
                  { src: '/images/everiithing/PIC%205%20SVG.svg', alt: 'Painting', h: '300px', m: '10px', w: '200px', mh: '200px', mm: '8px', mw: '140px' },
                  { src: '/images/everiithing/PIC%206%20SVG.svg', alt: 'Generator', h: '200px', m: '40px', w: '180px', mh: '140px', mm: '28px', mw: '120px' },
                  { src: '/images/everiithing/PIC%207%20SVG.svg', alt: 'Carpentry', h: '180px', m: '60px', w: '150px', mh: '120px', mm: '40px', mw: '100px' },
                ].map((img) => (
                  <div
                    key={img.alt + groupIdx}
                    className="shrink-0 overflow-hidden max-[430px]:!w-[50vw] max-[430px]:!h-[160px] max-[430px]:!mt-0"
                    style={{ width: img.w, height: img.h, borderRadius: '12px', marginTop: img.m }}
                  >
                    <Image src={img.src} alt={img.alt} width={4096} height={2734} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Achievements / Stats ─── */}
      <section className="py-6 lg:py-20" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Left Column */}
            <div className="w-full md:w-[45%] space-y-2">
              <h2 className="text-3xl md:text-4xl font-display font-bold leading-[1.15]" style={{ color: 'var(--md-on-surface)' }}>
                Our Achievements
              </h2>

              <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--md-on-surface-variant)' }}>
                We don&apos;t just vet providers. We hold them to a standard. Every verified badge on our platform tells a story of rigorous testing and earned trust.
              </p>

              {/* Stats Row */}
              <div className="flex items-start justify-between md:justify-start gap-6 md:gap-14">
                <AnimatedStat value={500} suffix="+" label="Verified Providers" shortLabel="Verified Pros" />
                <AnimatedStat value={1200} suffix="+" label="Jobs Completed" shortLabel="Jobs Done" />
                <AnimatedStat value={4.8} suffix="★" label="Average Rating" shortLabel="Client Rating" />
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/services"
                  aria-label="Book a Service"
                  className="flex items-center justify-center rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:scale-110 hover:brightness-110 active:scale-[0.97]"
                  style={{ width: '48px', height: '48px', backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                >
                  <ArrowRight size={20} />
                </Link>
                <span className="text-sm md:text-base font-medium" style={{ color: 'var(--md-on-surface)' }}>Book a Service</span>
              </div>
            </div>

            {/* Right Column — Image Card */}
            <AchievementImageCard />
          </div>
        </div>
      </section>

      {/* ─── What We Offer ─── */}
      <section className="py-20" style={{ backgroundColor: 'var(--md-surface)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
            {/* Left Column — Overlapping Cards */}
            <div className="w-full lg:w-[45%] relative" style={{ minHeight: '300px' }}>
              <div className="trust-card-wrapper relative w-full">
                {/* Card 1 (back) */}
                <div
                  className="trust-card-back absolute overflow-hidden"
                  style={{
                    width: '85%',
                    height: '320px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    zIndex: 1,
                  }}
                >
                  <Image src="/images/everiithing/PIC%205%20SVG.svg" alt="Painting service" width={4096} height={2734} className="w-full h-full object-cover" />
                </div>
                {/* Card 2 (front) */}
                <div
                  className="trust-card-front absolute overflow-hidden"
                  style={{
                    width: '65%',
                    height: '220px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                    zIndex: 2,
                  }}
                >
                  <Image src="/images/everiithing/PIC%207%20SVG.svg" alt="Carpentry service" width={4096} height={2730} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right Column — Text Content */}
            <div className="w-full lg:w-[55%]">
              <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight" style={{ color: 'var(--md-on-surface)' }}>
                Redefining trust, reliability, and quality in Nigeria&apos;s service industry.
              </h2>

              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--md-on-surface-variant)', maxWidth: '480px' }}>
                Finding an artisan in Nigeria shouldn&apos;t be a gamble. Everiithing.com connects you with verified local pros at flat, transparent prices with guaranteed quality
              </p>

              <h3 className="text-base font-semibold mt-5 md:mt-8" style={{ color: 'var(--md-on-surface)' }}>
                Why Customer Choose Us
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mt-5">
                {[
                  'Every provider is verified & screen',
                  'Transparent flat-rate pricing always',
                  'Satisfaction guarantee on every job',
                  'Trusted providers, zero guesswork',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="shrink-0 mt-1" style={{ color: 'var(--md-primary)' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="currentColor" />
                        <path d="M5 8.5L7 10.5L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-sm" style={{ color: 'var(--md-on-surface)' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 md:mt-8">
                <Link
                  href="/dashboard/book"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--md-tertiary)', color: 'var(--md-on-tertiary)' }}
                >
                  Book a Service <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Carousel ─── */}
      <ServicesCarousel />

      {/* ─── How It Works ─── */}
      <section className="pt-6 pb-6 px-6 lg:py-20" style={{ backgroundColor: '#adfae6' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 lg:mb-6">
            <h2 className="text-3xl lg:text-4xl font-display font-bold leading-tight" style={{ color: 'var(--md-on-surface)' }}>
              How it Works
            </h2>
            <p className="mx-auto mt-2" style={{ color: 'var(--md-on-surface-variant)' }}>
              Verified pros in three simple steps.
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-12 max-w-5xl mx-auto">
            <HowItWorksStep number={1} title="Book a Service" description="Select service. Pick a time. Book in 3 minutes" delay={0} icon={<CalendarCheck size={24} style={{ color: 'var(--md-on-tertiary)' }} />} />
            <HowItWorksStep number={2} title="We Match You" description="Instantly matched with verified pros. Zero haggling" delay={150} icon={<Users size={24} style={{ color: 'var(--md-on-tertiary)' }} />} />
            <HowItWorksStep number={3} title="Job Guaranteed" description="Seamless service. Pay only after you approve the work" delay={300} icon={<ShieldCheck size={24} style={{ color: 'var(--md-on-tertiary)' }} />} />
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <TestimonialsMarquee />

      {/* ─── CTA Banner ─── */}
      <section className="relative pt-14 pb-16 md:py-20 flex items-center justify-center overflow-hidden bg-[var(--md-primary)]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/images/everiithing/cta-bg.png)' }}
        />
        {/* Dark overlay */}
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

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export function AchievementImageCard() {
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
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full md:w-[55%] relative" style={{ borderRadius: '20px', overflow: 'visible', minHeight: 'clamp(280px, 35vw, 420px)' }}>
      <div style={{ borderRadius: '20px', overflow: 'hidden', position: 'absolute', inset: 0 }}>
        <Image
          src="/images/everiithing/PIC%206%20SVG.svg"
          alt="Provider team"
          width={4096}
          height={2734}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating Status Card */}
      <div
        className="achievement-status-card absolute bottom-8 left-[-20px] z-10 transition-all duration-700 ease-out"
        style={{
          backgroundColor: 'var(--md-surface)',
          borderRadius: '12px',
          border: '1px solid var(--md-outline-variant)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '16px 20px',
          minWidth: '220px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transitionDelay: visible ? '0.3s' : '0s',
        }}
      >
        <div style={{ transition: 'all 0.5s ease-out', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transitionDelay: visible ? '0.4s' : '0s' }}>
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-1" style={{ color: 'var(--md-on-surface-variant)' }}>STATUS</p>
        </div>
        <div style={{ transition: 'all 0.5s ease-out', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transitionDelay: visible ? '0.55s' : '0s' }}>
          <p className="text-[15px] font-semibold mb-3" style={{ color: 'var(--md-on-surface)' }}>Verified &amp; Active</p>
        </div>
        <div style={{ transition: 'all 0.6s ease-out', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transitionDelay: visible ? '0.7s' : '0s' }}>
          <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: 'var(--md-surface-variant)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: visible ? '92%' : '0%', backgroundColor: 'var(--md-primary)', transitionDelay: visible ? '0.9s' : '0s' }} />
          </div>
        </div>
        <div style={{ transition: 'all 0.5s ease-out', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transitionDelay: visible ? '0.85s' : '0s' }}>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--md-on-surface-variant)' }}>LAGOS PILOT</span>
            <span className="text-[10px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--md-on-surface-variant)' }}>92% SATISFACTION</span>
          </div>
        </div>
      </div>


    </div>
  )
}

'use client'

import { useState } from 'react'
import { Currency } from 'lucide-react'

export default function PricingPage() {
  const [commissionRate, setCommissionRate] = useState('18')

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800))
  }

  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: 'var(--color-surfaceContainerLowest)',
        boxShadow: '0 4px 24px rgba(13, 16, 33, 0.08)',
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-onSurface)' }}>
            Pricing Configuration
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            Set platform fees and commission rates
          </p>
        </div>
      </div>

      <div className="max-w-lg">
        <div
          className="rounded-2xl p-6 border"
          style={{
            backgroundColor: 'var(--color-surfaceContainerLow)',
            borderColor: 'var(--color-outlineVariant)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Currency size={18} style={{ color: 'var(--color-onPrimary)' }} />
            </div>
            <div>
              <p className="font-display font-semibold text-sm" style={{ color: 'var(--color-onSurface)' }}>
                Commission Rate
              </p>
              <p className="text-xs" style={{ color: 'var(--color-onSurfaceVariant)' }}>
                Set the percentage deducted from each booking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-24 border rounded-lg px-3 py-2 text-lg font-display font-bold text-center bg-transparent"
              style={{ borderColor: 'var(--color-outlineVariant)', color: 'var(--color-onSurface)' }}
            />
            <span className="text-lg font-display font-bold" style={{ color: 'var(--color-onSurface)' }}>%</span>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--color-onSurfaceVariant)' }}>
            This percentage is deducted from each booking as the platform fee.
          </p>
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

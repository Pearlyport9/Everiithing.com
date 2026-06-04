'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function PricingPage() {
  const [commissionRate, setCommissionRate] = useState('18')

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800))
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-navy-900 mb-8">
        Pricing Configuration
      </h1>

      <div className="max-w-lg bg-white rounded-xl p-6 shadow-sm border border-neutral-100 space-y-4">
        <Input
          label="Platform Commission Rate (%)"
          type="number"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
        />
        <p className="text-xs text-neutral-500">
          This percentage is deducted from each booking as the platform fee.
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [lga, setLga] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-navy-900 mb-8">
        Profile
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 space-y-4">
        <Input
          label="Full Name"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Phone Number"
          placeholder="+234 800 000 0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="LGA"
          placeholder="e.g. Ikeja"
          value={lga}
          onChange={(e) => setLga(e.target.value)}
        />
        <div className="pt-2">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

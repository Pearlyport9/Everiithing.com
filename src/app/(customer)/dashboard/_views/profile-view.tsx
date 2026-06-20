'use client'

import { useState, useEffect } from 'react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { FieldRow } from '@/components/profile/FieldRow'

export default function ProfileView() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [lga, setLga] = useState('')
  const [memberSince, setMemberSince] = useState('')

  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)

  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: { user }, error: authErr } = await supabase.auth.getUser()
        if (authErr || !user) {
          setFetchError('Unable to load your profile. Please sign in again.')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, lga, created_at')
          .eq('id', user.id)
          .single()

        if (profile) {
          const parts = (profile.full_name || '').split(' ')
          setFirstName(parts[0] || '')
          setLastName(parts.slice(1).join(' ') || '')
          setPhone(profile.phone || '')
          setLga(profile.lga || '')
          const d = new Date(profile.created_at)
          setMemberSince(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }))
        }

        setEmail(user.email || '')
      } catch {
        setFetchError('Something went wrong loading your profile.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleSave = async (section: 'personal' | 'location') => {
    setToast(null)
    setSaving(true)

    const body: Record<string, string> = {}
    if (section === 'personal') {
      body.full_name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
      body.phone = phone.trim()
      body.lga = lga.trim()
    } else {
      body.full_name = fullName
      body.phone = phone.trim()
      body.lga = lga.trim()
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!data.success) {
        setToast({ type: 'error', message: data.error?.message || 'Failed to update profile. Try again.' })
        setSaving(false)
        return
      }

      setToast({ type: 'success', message: 'Profile updated successfully' })
      setEditingPersonal(false)
      setEditingLocation(false)
    } catch {
      setToast({ type: 'error', message: 'Failed to update profile. Try again.' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 rounded-xl bg-token-outlineVariant" />
        <div className="h-48 rounded-xl bg-token-outlineVariant" />
        <div className="h-32 rounded-xl bg-token-outlineVariant" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-token-error bg-token-errorContainer/20 px-4 py-3 rounded-lg">{fetchError}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ProfileHeader
        fullName={fullName}
        role="Customer"
        location={[lga, 'Lagos'].filter(Boolean).join(', ')}
      />

      <ProfileCard
        title="Personal Information"
        editing={editingPersonal}
        onToggleEdit={() => {
          if (editingPersonal) {
            handleSave('personal')
          } else {
            setEditingLocation(false)
            setEditingPersonal(true)
          }
        }}
        saving={saving}
      >
        {editingPersonal ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">First Name</label>
              <input
                type="text"
                className="input-field"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">Last Name</label>
              <input
                type="text"
                className="input-field"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">Email Address</label>
              <input
                type="email"
                className="input-field opacity-60 cursor-not-allowed"
                value={email}
                readOnly
                tabIndex={-1}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">Member Since</label>
              <input
                type="text"
                className="input-field opacity-60 cursor-not-allowed"
                value={memberSince}
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FieldRow label="First Name" value={firstName} />
            <FieldRow label="Last Name" value={lastName} />
            <FieldRow label="Phone Number" value={phone} />
            <FieldRow label="Email Address" value={email} readOnly />
            <FieldRow label="Member Since" value={memberSince} readOnly />
          </div>
        )}
      </ProfileCard>

      <ProfileCard
        title="Location"
        editing={editingLocation}
        onToggleEdit={() => {
          if (editingLocation) {
            handleSave('location')
          } else {
            setEditingPersonal(false)
            setEditingLocation(true)
          }
        }}
        saving={saving}
      >
        {editingLocation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">Neighborhood</label>
              <input
                type="text"
                className="input-field"
                value={lga}
                onChange={(e) => setLga(e.target.value)}
                placeholder="e.g. Lekki Phase 1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-token-onSurfaceVariant">City</label>
              <input
                type="text"
                className="input-field opacity-60 cursor-not-allowed"
                value="Lagos"
                readOnly
                tabIndex={-1}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FieldRow label="Neighborhood" value={lga} />
            <FieldRow label="City" value="Lagos" readOnly />
          </div>
        )}
      </ProfileCard>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-token-primary text-token-onPrimary'
              : 'bg-token-error text-token-onError'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

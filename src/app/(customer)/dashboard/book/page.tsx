'use client'

import { useState } from 'react'
import StepIndicator from '@/components/shared/StepIndicator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const steps = ['Choose Service', 'Schedule & Address', 'Review & Pay']

const services = [
  { id: '1', name: 'Plumbing', slug: 'plumbing' },
  { id: '2', name: 'Electrical', slug: 'electrical' },
  { id: '3', name: 'AC Services', slug: 'ac-services' },
  { id: '4', name: 'Generator & Inverter', slug: 'generator-inverter' },
  { id: '5', name: 'Painting', slug: 'painting' },
  { id: '6', name: 'Deep Cleaning', slug: 'deep-cleaning' },
  { id: '7', name: 'Carpentry', slug: 'carpentry' },
]

export default function BookServicePage() {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [address, setAddress] = useState('')
  const [lga, setLga] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: selectedService,
        scheduled_date: date,
        scheduled_time: time,
        address,
        lga,
        notes,
      }),
    })
    setSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-navy-900 mb-8">
        Book a Service
      </h1>

      <StepIndicator steps={steps} currentStep={step} />

      <div className="mt-10">
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                hover
                className={`cursor-pointer p-4 ${
                  selectedService === service.id
                    ? 'ring-2 ring-accent-500 border-accent-500'
                    : ''
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <h3 className="font-display font-semibold text-navy-900">
                  {service.name}
                </h3>
              </Card>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Scheduled Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="Scheduled Time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Input
              label="Address"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              label="LGA"
              placeholder="e.g. Ikeja"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
            />
            <Input
              label="Notes (optional)"
              placeholder="Any special instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100 space-y-3">
            <h3 className="font-display font-semibold text-lg">Review Your Booking</h3>
            <div className="text-sm text-neutral-700 space-y-1">
              <p><span className="font-medium">Service:</span> {services.find((s) => s.id === selectedService)?.name || 'N/A'}</p>
              <p><span className="font-medium">Date:</span> {date || 'N/A'}</p>
              <p><span className="font-medium">Time:</span> {time || 'N/A'}</p>
              <p><span className="font-medium">Address:</span> {address || 'N/A'}</p>
              <p><span className="font-medium">LGA:</span> {lga || 'N/A'}</p>
              {notes && <p><span className="font-medium">Notes:</span> {notes}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        {step > 0 ? (
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        ) : (
          <div />
        )}
        {step < 2 ? (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={
              (step === 0 && !selectedService) ||
              (step === 1 && (!date || !time || !address || !lga))
            }
          >
            Continue
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Confirm & Pay'}
          </Button>
        )}
      </div>
    </div>
  )
}

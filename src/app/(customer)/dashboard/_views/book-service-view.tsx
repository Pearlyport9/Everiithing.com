'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Wrench, Zap, Wind, Battery, PaintBucket, Sparkles, Hammer,
  Check, ArrowLeft, Upload, HelpCircle,
} from 'lucide-react'
import { StepIndicator } from '@/components/shared/StepIndicator'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { useFlutterwaveCheckout } from '@/lib/flutterwave/useFlutterwaveCheckout'
import type { Service } from '@/types'
import { CALL_OUT_FEE } from '@/lib/constants'

const steps = ['Category', 'Service', 'Schedule', 'Confirm']

const slugToIcon: Record<string, React.ElementType> = {
  plumbing: Wrench,
  electrical: Zap,
  'ac-services': Wind,
  'generator-inverter': Battery,
  painting: PaintBucket,
  'deep-cleaning': Sparkles,
  carpentry: Hammer,
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function BookServiceView() {
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubService, setSelectedSubService] = useState<Service | null>(null)
  const [subServices, setSubServices] = useState<Service[]>([])
  const [loadingSubServices, setLoadingSubServices] = useState(false)
  const [subServicesError, setSubServicesError] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [address, setAddress] = useState('')
  const [lga, setLga] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [isCustomRequest, setIsCustomRequest] = useState(false)
  const [customDescription, setCustomDescription] = useState('')
  const [customError, setCustomError] = useState('')
  const [customPhoto, setCustomPhoto] = useState<File | null>(null)
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(null)
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [customLga, setCustomLga] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { sdkLoaded, openCheckout } = useFlutterwaveCheckout()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true)
      setCategoriesError('')
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Failed to load categories:', error)
        setCategoriesError('Could not load service categories.')
      } else if (data) {
        setCategories(data)
      }
      setLoadingCategories(false)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (step === 1 && selectedCategory && !isCustomRequest) {
      setSubServices([])
      setSelectedSubService(null)
      setSubServicesError('')
      fetchSubServices(selectedCategory.id)
    }
  }, [step, selectedCategory?.id, isCustomRequest])

  useEffect(() => {
    const serviceId = searchParams.get('service')
    if (!serviceId || categories.length === 0) return

    async function preSelectService() {
      const { data: svc } = await supabase
        .from('services')
        .select('id, category_id, name, description, base_price_ngn, duration_hours')
        .eq('id', serviceId)
        .single()

      if (!svc) return

      const category = categories.find((c: Category) => c.id === svc.category_id)
      if (!category) return

      setSelectedCategory(category)
      setSelectedSubService(svc as Service)
      setStep(2)
    }

    preSelectService()
  }, [searchParams, categories])

  async function fetchSubServices(categoryId: string) {
    setLoadingSubServices(true)
    const { data, error } = await supabase
      .from('services')
      .select('id, category_id, name, description, base_price_ngn, duration_hours')
      .eq('category_id', categoryId)
      .eq('is_active', true)

    if (error) {
      console.error('Failed to load sub-services:', error)
      setSubServicesError('Could not load services.')
    } else if (data) {
      setSubServices(data)
    }
    setLoadingSubServices(false)
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (isCustomRequest) {
      setIsCustomRequest(false)
      setCustomDescription('')
      setCustomPhoto(null)
      setCustomPhotoPreview(null)
      setCustomDate('')
      setCustomTime('')
      setCustomAddress('')
      setCustomLga('')
      setCustomError('')
      return
    }
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setSubmitError('')
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError('You must be logged in to book a service.')
      setSubmitting(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const customerName = profile?.full_name || user.email?.split('@')[0] || 'Customer'

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: selectedSubService!.id,
        scheduled_date: date,
        scheduled_time: time,
        address,
        lga,
        notes: notes || null,
      }),
    })

    const json = await res.json()

    if (!json.success || !json.data) {
      setSubmitError(json.error?.message || 'Failed to create booking.')
      setSubmitting(false)
      return
    }

    const booking = json.data
    const txRef = booking.flw_tx_ref

    const { data: { user: sessionCheck } } = await supabase.auth.getUser()
    if (sessionCheck) {
      fetch('/api/payments/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          flw_tx_ref: txRef,
          event_type: 'payment_initiated',
          status: 'initiated',
          expected_amount: booking.price_ngn,
        }),
      }).catch(() => {})
    }

    let redirected = false
    const redirect = () => {
      if (redirected) return
      redirected = true
      window.location.href = '/dashboard/bookings'
    }

    try {
      openCheckout({
        tx_ref: txRef,
        amount: booking.price_ngn,
        customer: {
          email: user.email!,
          name: customerName,
        },
        customizations: {
          title: 'Everiithing\u2022com',
          description: selectedSubService?.name ?? 'Home Service Booking',
        },
        meta: {
          booking_id: booking.id,
        },
        callback: () => redirect(),
        onclose: () => redirect(),
      })
    } catch (err) {
      console.error('Failed to open checkout:', err)
      setSubmitError('Payment system not ready. Please refresh and try again.')
      setSubmitting(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCustomPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setCustomPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCustomSubmit = async () => {
    if (!customDescription || !customDate || !customTime || !customAddress || !customLga) return

    setCustomError('')
    setIsSubmittingCustom(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setCustomError('You must be logged in to submit a request.')
      setIsSubmittingCustom(false)
      return
    }

    let photoUrl: string | null = null
    if (customPhoto) {
      try {
        const ext = customPhoto.name.split('.').pop()
        const fileName = `quote-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('booking-photos')
          .upload(fileName, customPhoto, {
            cacheControl: '3600',
            upsert: false,
          })
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('booking-photos')
            .getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      } catch (uploadErr) {
        console.error('Photo upload error:', uploadErr)
      }
    }

    const { error: insertError } = await supabase.from('bookings').insert({
      customer_id: user.id,
      service_id: null,
      scheduled_date: customDate,
      scheduled_time: customTime,
      address: customAddress,
      lga: customLga,
      notes: customDescription,
      price_ngn: 0,
      status: 'pending_quote',
      payment_status: 'unpaid',
    })

    if (insertError) {
      console.error('Quote booking insert failed:', insertError)
      setCustomError(insertError.message)
      setIsSubmittingCustom(false)
      return
    }

    fetch('/api/bookings/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: customDescription,
        preferred_date: customDate,
        preferred_time: customTime,
        address: customAddress,
        lga: customLga,
      }),
    }).catch((err) => console.error('Quote email notification failed:', err))

    window.location.href = '/dashboard/bookings'
  }

  const formatPrice = (n: number) => `₦${n.toLocaleString('en-NG')}`

  const customFormValid = customDescription && customDate && customTime && customAddress && customLga

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl md:text-2xl font-display font-bold text-token-onSurface mb-6 md:mb-8 text-center">
        Book a Service
      </h1>

      <StepIndicator steps={steps} currentStep={step} />

      <div className="rounded-2xl" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}>
        {step === 0 && (
          <>
            <div className="p-4 md:p-8 pb-0">
              <h2 className="font-display font-semibold text-lg md:text-[22px] text-[--md-on-surface] text-center">
                What service do you need?
              </h2>
              <p className="text-sm text-[--md-on-surface-variant] mt-1 mb-4 md:mb-6 text-center">
                Select a category to get started
              </p>

              {loadingCategories ? (
                <div className="text-center py-6 md:py-12 text-sm text-[--md-on-surface-variant]">
                  Loading categories...
                </div>
              ) : categoriesError ? (
                <div className="text-center py-6 md:py-12 text-sm text-[--md-error]">
                  {categoriesError}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {categories.map((cat, idx) => {
                    const Icon = slugToIcon[cat.slug] || HelpCircle
                    const isSelected = selectedCategory?.id === cat.id
                    const isLast = idx === categories.length - 1
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                          relative rounded-2xl p-6 cursor-pointer
                          transition-all duration-200 ease-out
                          bg-[var(--color-surfaceContainerLowest)]
                          ${isSelected
                            ? 'bg-[--md-primary-container]/30 border-2 border-[--md-primary]'
                            : 'border border-[--md-outline-variant] hover:border-[--md-primary] hover:shadow-[0_4px_16px_rgba(14,122,95,0.12)] hover:-translate-y-0.5'
                          }
                          ${isLast ? 'col-span-full' : ''}
                        `}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedCategory(cat)
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[--md-primary] flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}

                        <div className="flex flex-col items-start">
                          <div className="w-12 h-12 rounded-full bg-[--md-primary-container] flex items-center justify-center">
                            <Icon size={24} className="text-[--md-primary]" />
                          </div>

                          <h3 className="font-display font-semibold text-base text-[--md-on-surface] mt-4">
                            {cat.name}
                          </h3>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[--md-outline-variant] px-4 md:px-8 py-3 md:py-4 mt-6 md:mt-8">
              <div className="flex items-center justify-between">
                <div>
                  {selectedCategory && (
                    <span className="flex items-center gap-2 text-sm text-[--md-on-surface-variant]">
                      <Check size={16} className="text-[--md-primary]" />
                      Selected: {selectedCategory.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  disabled={!selectedCategory}
                  className={`
                    bg-[--md-primary] text-white rounded-lg px-8 py-3 font-semibold text-base
                    transition-all duration-base
                    ${!selectedCategory ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-md'}
                  `}
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          </>
        )}

        {step === 1 && !isCustomRequest && (
          <>
            <div className="p-4 md:p-8 pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[--md-on-surface-variant] uppercase tracking-wider">
                  {selectedCategory?.name}
                </span>
              </div>
              <h2 className="font-display font-semibold text-lg md:text-[22px] text-[--md-on-surface]">
                What exactly do you need?
              </h2>
              <p className="text-sm text-[--md-on-surface-variant] mt-1">
                Select the specific service
              </p>
              <p className="text-sm text-[--md-on-surface-variant] mt-1 mb-4 md:mb-6 leading-relaxed max-w-prose">
                A flat call-out fee of {formatPrice(CALL_OUT_FEE)} covers a vetted provider&apos;s visit and assessment, and counts toward your final bill. Any materials or extra work are quoted after inspection, and you approve before anything proceeds. The call-out fee is non-refundable, even if you choose not to proceed after the quote.
              </p>

              {loadingSubServices ? (
                <div className="text-center py-6 md:py-12 text-sm text-[--md-on-surface-variant]">
                  Loading services...
                </div>
              ) : subServicesError ? (
                <div className="text-center py-6 md:py-12 text-sm text-[--md-error]">
                  {subServicesError}
                </div>
              ) : subServices.length === 0 ? (
                <div className="text-center py-6 md:py-12 text-sm text-[--md-on-surface-variant]">
                  No services available for this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subServices.map((svc) => {
                    const isSelected = selectedSubService?.id === svc.id
                    return (
                      <div
                        key={svc.id}
                        onClick={() => {
                          setSelectedSubService(svc)
                          setIsCustomRequest(false)
                        }}
                        className={`
                          relative rounded-2xl p-5 cursor-pointer
                          transition-all duration-200 ease-out
                          bg-[var(--color-surfaceContainerLowest)]
                          ${isSelected
                            ? 'bg-[--md-primary-container]/30 border-2 border-[--md-primary]'
                            : 'border border-[--md-outline-variant] hover:border-[--md-primary] hover:shadow-[0_4px_16px_rgba(14,122,95,0.12)] hover:-translate-y-0.5'
                          }
                        `}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedSubService(svc)
                            setIsCustomRequest(false)
                          }
                        }}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[--md-primary] flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}

                        <h3 className="font-display font-semibold text-base text-[--md-on-surface] pr-8">
                          {svc.name}
                        </h3>

                        {svc.description && (
                          <p className="text-base text-[--md-on-surface-variant] mt-1">
                            {svc.description}
                          </p>
                        )}

                        <p className="font-semibold text-sm text-[--md-primary] mt-3">
                          Call-out fee: {formatPrice(CALL_OUT_FEE)}
                        </p>
                        <p className="text-xs text-[--md-on-surface-variant] mt-0.5">
                          Visit &amp; assessment &mdash; final price confirmed after inspection
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              <div
                onClick={() => {
                  setSelectedSubService(null)
                  setIsCustomRequest(true)
                }}
                className="mt-4 rounded-2xl p-4 cursor-pointer transition-all duration-200 ease-out border-2 border-dashed border-[--md-outline-variant] hover:border-[--md-primary] hover:bg-[--md-primary-container]/10"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedSubService(null)
                    setIsCustomRequest(true)
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[--md-surface-variant] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle size={20} className="text-[--md-on-surface-variant]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-[--md-on-surface]">
                      Something else?
                    </h3>
                    <p className="text-xs text-[--md-on-surface-variant] mt-0.5">
                      Can&apos;t find what you need? Request a custom service.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[--md-outline-variant] px-4 md:px-8 py-3 md:py-4 mt-6 md:mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    onClick={handleBack}
                    className="text-sm text-[--md-on-surface-variant] hover:text-[--md-on-surface] flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  {selectedSubService && (
                    <span className="hidden md:flex items-center gap-2 text-sm text-[--md-on-surface-variant]">
                      <Check size={16} className="text-[--md-primary]" />
                      {selectedSubService.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleNext}
                  disabled={!selectedSubService}
                  className={`
                    bg-[--md-primary] text-white rounded-lg px-5 md:px-8 py-2.5 md:py-3 font-semibold text-sm md:text-base
                    transition-all duration-base
                    ${!selectedSubService ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-md'}
                  `}
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          </>
        )}

        {step === 1 && isCustomRequest && (
          <>
            <div className="p-4 md:p-8 pb-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[--md-on-surface-variant] uppercase tracking-wider">
                  {selectedCategory?.name}
                </span>
              </div>
              <h2 className="font-display font-semibold text-lg md:text-[22px] text-[--md-on-surface]">
                Tell us what you need
              </h2>
              <p className="text-sm text-[--md-on-surface-variant] mt-1 mb-4 md:mb-6">
                Describe the service and we&apos;ll get back to you with a quote
              </p>

              {customError && (
                <div className="mb-5 p-3 rounded-lg bg-[--md-error]/10 border border-[--md-error]/30 text-sm text-[--md-error]">
                  {customError}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[--md-on-surface] mb-1.5">
                    Describe what you need <span className="text-[--md-error]">*</span>
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Tell us about the service you need..."
                    rows={4}
                    className="w-full border-2 border-[--md-outline] rounded-lg px-4 py-3 text-sm text-[--md-on-surface] focus:border-[--md-primary] focus:outline-none transition-colors duration-fast resize-none" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[--md-on-surface] mb-1.5">
                    Photo (optional)
                  </label>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {customPhotoPreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[--md-outline-variant]">
                      <img
                        src={customPhotoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setCustomPhoto(null)
                          setCustomPhotoPreview(null)
                          if (photoInputRef.current) photoInputRef.current.value = ''
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-xs"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[--md-outline-variant] rounded-xl text-sm text-[--md-on-surface-variant] hover:border-[--md-primary] hover:text-[--md-primary] transition-colors duration-fast"
                    >
                      <Upload size={18} />
                      Upload a photo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[--md-on-surface] mb-1.5">
                      Preferred date <span className="text-[--md-error]">*</span>
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full border-2 border-[--md-outline] rounded-lg px-4 py-[14px] text-sm text-[--md-on-surface] focus:border-[--md-primary] focus:outline-none transition-colors duration-fast" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[--md-on-surface] mb-1.5">
                      Preferred time <span className="text-[--md-error]">*</span>
                    </label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full border-2 border-[--md-outline] rounded-lg px-4 py-[14px] text-sm text-[--md-on-surface] focus:border-[--md-primary] focus:outline-none transition-colors duration-fast" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[--md-on-surface] mb-1.5">
                    Address <span className="text-[--md-error]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="Enter your full address"
                    className="w-full border-2 border-[--md-outline] rounded-lg px-4 py-[14px] text-sm text-[--md-on-surface] focus:border-[--md-primary] focus:outline-none transition-colors duration-fast" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[--md-on-surface] mb-1.5">
                    LGA <span className="text-[--md-error]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customLga}
                    onChange={(e) => setCustomLga(e.target.value)}
                    placeholder="e.g. Ikeja"
                    className="w-full border-2 border-[--md-outline] rounded-lg px-4 py-[14px] text-sm text-[--md-on-surface] focus:border-[--md-primary] focus:outline-none transition-colors duration-fast" style={{ backgroundColor: 'var(--color-surfaceContainerLowest)' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[--md-outline-variant] px-4 md:px-8 py-3 md:py-4 mt-6 md:mt-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="text-sm text-[--md-on-surface-variant] hover:text-[--md-on-surface] flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customFormValid || isSubmittingCustom}
                  className={`
                    bg-[--md-primary] text-white rounded-lg px-5 md:px-8 py-2.5 md:py-3 font-semibold text-sm md:text-base
                    transition-all duration-base
                    ${(!customFormValid || isSubmittingCustom) ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-md'}
                  `}
                >
                  {isSubmittingCustom ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="p-4 md:p-8">
            {submitError && (
              <div className="mb-5 p-3 rounded-lg bg-[--md-error]/10 border border-[--md-error]/30 text-sm text-[--md-error]">
                {submitError}
              </div>
            )}
            <div className="space-y-4">
              <Input label="Scheduled Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input label="Scheduled Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <Input label="Address" placeholder="Enter your full address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <Input label="LGA" placeholder="e.g. Ikeja" value={lga} onChange={(e) => setLga(e.target.value)} />
              <Input label="Notes (optional)" placeholder="Any special instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button variant="primary" onClick={handleNext}
                disabled={!date || !time || !address || !lga}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-4 md:p-8">
            <div className="bg-token-surface rounded-xl p-4 md:p-6 shadow-sm border border-token-outlineVariant space-y-3">
              <h3 className="font-display font-semibold text-lg">Review Your Booking</h3>
              <div className="text-sm text-token-onSurfaceVariant space-y-1">
                <p><span className="font-medium">Category:</span> {selectedCategory?.name || 'N/A'}</p>
                <p><span className="font-medium">Service:</span> {selectedSubService?.name || 'N/A'}</p>
                <p>
                  <span className="font-medium">Call-out fee:</span>{' '}
                  {formatPrice(CALL_OUT_FEE)}
                </p>
                <p><span className="font-medium">Date:</span> {date || 'N/A'}</p>
                <p><span className="font-medium">Time:</span> {time || 'N/A'}</p>
                <p><span className="font-medium">Address:</span> {address || 'N/A'}</p>
                <p><span className="font-medium">LGA:</span> {lga || 'N/A'}</p>
                {notes && <p><span className="font-medium">Notes:</span> {notes}</p>}
              </div>

              <hr className="border-token-outlineVariant my-2" />

              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-base text-token-onSurface">Total</span>
                <span className="font-display font-bold text-xl text-token-primary">
                  {formatPrice(CALL_OUT_FEE)}
                </span>
              </div>
            </div>
            <p className="text-xs text-[--md-on-surface-variant] mt-6 mb-2 text-center">
              Your call-out fee is non-refundable &mdash; it pays for the provider&apos;s visit and assessment.
            </p>
            <div className="flex justify-between">
              <Button variant="secondary" onClick={handleBack}>Back</Button>
              <Button variant="primary" onClick={handleSubmit} disabled={submitting || !sdkLoaded}>
                {submitting ? 'Submitting...' : !sdkLoaded ? 'Loading payment...' : 'Confirm & Pay'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

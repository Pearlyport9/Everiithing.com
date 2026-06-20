'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void
  }
}

export function useFlutterwaveCheckout() {
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.FlutterwaveCheckout) {
      setSdkLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    script.onload = () => setSdkLoaded(true)
    document.body.appendChild(script)
    scriptRef.current = script
    return () => {
      scriptRef.current?.parentNode?.removeChild(scriptRef.current)
    }
  }, [])

  const openCheckout = useCallback(
    (config: {
      tx_ref: string
      amount: number
      currency?: string
      customer: { email: string; name: string; phonenumber?: string }
      customizations?: { title?: string; description?: string; logo?: string }
      meta?: Record<string, string>
      callback: (response: { transaction_id?: number; tx_ref: string; status: string }) => void
      onclose: () => void
    }) => {
      if (!window.FlutterwaveCheckout) throw new Error('Flutterwave SDK not loaded yet. Please refresh and try again.')
      window.FlutterwaveCheckout({
        public_key: process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY,
        ...config,
        currency: config.currency ?? 'NGN',
        payment_options: 'card,ussd,banktransfer',
      })
    },
    [],
  )

  return { sdkLoaded, openCheckout }
}

import PolicyLayout from '@/components/shared/PolicyLayout'

const sections = [
  {
    id: 'call-out-fee',
    title: '1. Call-Out Fee',
    content: (
      <>
        <p>
          The ₦5,000 call-out fee is <strong>non-refundable</strong> once a
          provider has been dispatched
        </p>
        <p>
          If you cancel before the provider is assigned, you will receive a full
          refund within 3–5 business days
        </p>
        <p>
          If you cancel after assignment but before arrival, a 50% refund
          applies
        </p>
      </>
    ),
  },
  {
    id: 'job-disputes',
    title: '2. Job Disputes',
    content: (
      <>
        <p>
          If you are unhappy with the work done, raise a dispute within 48 hours
          of job completion
        </p>
        <p>Do not release payment until you are satisfied with the work</p>
        <p>
          Our team will review the dispute and contact both parties within 2
          business days
        </p>
      </>
    ),
  },
  {
    id: 'refund-process',
    title: '3. Refund Process',
    content: (
      <>
        <p>
          Approved refunds are processed back to your original payment method
        </p>
        <p>Refunds typically take 3–7 business days depending on your bank</p>
        <p>
          Escrow payments that are disputed will be held until resolution
        </p>
      </>
    ),
  },
  {
    id: 'contact-us',
    title: '4. Contact Us',
    content: (
      <>
        <p>
          Have a question about a refund or dispute?
        </p>
        <p>
          <strong>Email:</strong> hello@everiithing.com
        </p>
        <p>
          <strong>Response time:</strong> within 24 hours on business days
        </p>
        <p>
          We are committed to resolving every issue fairly and promptly
        </p>
      </>
    ),
  },
]

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtext="Last updated: June 2026 — We believe in fair outcomes. Here's how refunds work on Everiithing."
      sections={sections}
    />
  )
}

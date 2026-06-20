import PolicyLayout from '@/components/shared/PolicyLayout'

const sections = [
  {
    id: 'using-everiithing',
    title: '1. Using Everiithing',
    content: (
      <>
        <p>
          You must be 18 or older to use this platform
        </p>
        <p>
          You agree to provide accurate information when booking
        </p>
        <p>
          You will not misuse the platform or attempt to contact providers
          outside of Everiithing
        </p>
        <p>
          We reserve the right to suspend accounts that violate these terms
        </p>
      </>
    ),
  },
  {
    id: 'bookings-and-payments',
    title: '2. Bookings & Payments',
    content: (
      <>
        <p>
          A flat ₦5,000 call-out fee is charged when you book a service
        </p>
        <p>
          This fee covers the provider&apos;s visit to assess the job — it is
          non-refundable once the provider arrives
        </p>
        <p>
          After assessment, your provider sends a quote. You decide whether to
          proceed
        </p>
        <p>
          Full payment is held in escrow and only released to the provider after
          you approve the work
        </p>
      </>
    ),
  },
  {
    id: 'our-responsibilities',
    title: '3. Our Responsibilities',
    content: (
      <>
        <p>We vet and verify every provider on our platform</p>
        <p>
          We do not guarantee specific outcomes but we do guarantee a verified,
          professional provider
        </p>
        <p>
          We are not liable for damages caused by misuse of the platform or
          inaccurate job descriptions
        </p>
        <p>
          If something goes wrong, contact us and we will work to resolve it
          fairly
        </p>
      </>
    ),
  },
  {
    id: 'account-rules',
    title: '4. Account Rules',
    content: (
      <>
        <p>One account per person</p>
        <p>
          Keep your login details secure — you are responsible for activity on
          your account
        </p>
        <p>Do not create fake reviews or manipulate ratings</p>
        <p>Accounts found in violation will be suspended without refund</p>
      </>
    ),
  },
]

export default function TermsOfServicePage() {
  return (
    <PolicyLayout
      title="Terms of Service"
      subtext="Last updated: June 2026 — By using Everiithing.com, you agree to these terms. We've kept them short and honest."
      sections={sections}
    />
  )
}

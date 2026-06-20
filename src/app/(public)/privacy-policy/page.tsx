import PolicyLayout from '@/components/shared/PolicyLayout'

const sections = [
  {
    id: 'what-we-collect',
    title: '1. What We Collect',
    content: (
      <>
        <p>
          <strong>Account info</strong> — your name, email, phone number and
          address when you sign up
        </p>
        <p>
          <strong>Booking info</strong> — the services you book, your location,
          and job details
        </p>
        <p>
          <strong>Payment info</strong> — processed securely via Flutterwave. We
          never store your card details
        </p>
        <p>
          <strong>Device info</strong> — browser type, IP address, and how you
          use the platform
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: '2. How We Use It',
    content: (
      <>
        <p>To match you with the right verified provider</p>
        <p>To process and confirm your bookings</p>
        <p>To send you updates about your job status</p>
        <p>To improve the platform and fix issues</p>
        <p>We do not sell your data. Ever.</p>
      </>
    ),
  },
  {
    id: 'who-we-share-it-with',
    title: '3. Who We Share It With',
    content: (
      <>
        <p>
          <strong>Providers</strong> — only the details they need to complete
          your job (name, location, job description)
        </p>
        <p>
          <strong>Flutterwave</strong> — to process payments securely
        </p>
        <p>
          <strong>Legal authorities</strong> — only if required by Nigerian law
        </p>
        <p>No third-party advertisers. No data brokers.</p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: '4. Your Rights',
    content: (
      <>
        <p>Request a copy of your data at any time</p>
        <p>Ask us to delete your account and data</p>
        <p>Opt out of marketing emails</p>
        <p>
          Contact us at: <strong>hello@everiithing.com</strong>
        </p>
      </>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtext="Last updated: June 2026 — We keep this simple. Here's exactly what we do with your information."
      sections={sections}
    />
  )
}

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  return resend.emails.send({
    from: 'Everiithing <hello@everiithing.com>',
    to,
    subject,
    html,
  })
}

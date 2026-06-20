import sanitizeHtml from 'sanitize-html'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/nodemailer/sendEmail'

const sanitize = (val: string) => sanitizeHtml(val.trim(), { allowedTags: [], allowedAttributes: {} })

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      )
    }

    await sendEmail({
      to: process.env.EMAIL_USER || '',
      subject: `Contact Form — ${sanitize(subject)}`,
      html: `
        <h2>New Contact Message</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;font-weight:600;border:1px solid #ddd;">Name</td><td style="padding:8px;border:1px solid #ddd;">${sanitize(name)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #ddd;">Email</td><td style="padding:8px;border:1px solid #ddd;">${sanitize(email)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #ddd;">Subject</td><td style="padding:8px;border:1px solid #ddd;">${sanitize(subject)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;border:1px solid #ddd;">Message</td><td style="padding:8px;border:1px solid #ddd;">${sanitize(message)}</td></tr>
        </table>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}

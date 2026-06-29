import jsPDF from 'jspdf'

interface BookingPdfData {
  id: string
  serviceName: string | null
  status: string
  created_at: string
  scheduled_date: string
  scheduled_time: string
  customerName: string | null
  address: string
  lga: string
  price_ngn: number
  quoted_total_ngn: number | null
  topup_owed_ngn: number | null
  quote_notes: string | null
  providerName: string | null
}

const PRIMARY = '#0F7A5C'
const DARK = '#1A2E2A'
const MUTED = '#5C6B63'
const LIGHT_BG = '#EDF9F5'
const WHITE = '#FFFFFF'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatNaira(amount: number) {
  return `\u20A6\u00A0${Intl.NumberFormat('en-NG').format(amount)}`
}

function ref(id: string) {
  return `EV-${id.slice(0, 8).toUpperCase()}`
}

function sectionHeader(doc: jsPDF, y: number, title: string): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text(title.toUpperCase(), 20, y)
  doc.setDrawColor('#D0D9D4')
  doc.setLineWidth(0.4)
  doc.line(20, y + 1.5, 190, y + 1.5)
}

function labelValue(
  doc: jsPDF,
  y: number,
  label: string,
  value: string,
  opts?: { boldValue?: boolean; valueColor?: string },
) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(MUTED)
  doc.text(label, 20, y)
  doc.setFont('helvetica', opts?.boldValue ? 'bold' : 'normal')
  doc.setFontSize(10)
  doc.setTextColor(opts?.valueColor || DARK)
  const labelWidth = doc.getTextWidth(`${label}  `)
  doc.text(value, 20 + labelWidth, y)
  return y + 6
}

export function generateBookingPdf(data: BookingPdfData): void {
  const doc = new jsPDF('portrait', 'mm', 'a4')
  const pageWidth = 210
  let y = 20

  // Header bar
  doc.setFillColor(PRIMARY)
  doc.rect(0, y - 6, pageWidth, 14, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(WHITE)
  doc.text('BOOKING DETAILS', 20, y + 3.5)

  y += 18

  // Booking reference
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(DARK)
  doc.text(`Reference:  ${ref(data.id)}`, 20, y)
  y += 12

  // Service section
  sectionHeader(doc, y, 'Service')
  y += 7
  y = labelValue(doc, y, 'Service', data.serviceName || 'Custom Request', { boldValue: true })
  y = labelValue(doc, y, 'Status', data.status.replace(/_/g, ' '))
  y = labelValue(doc, y, 'Booked', formatTimestamp(data.created_at))
  y = labelValue(doc, y, 'Scheduled', `${formatDate(data.scheduled_date)} at ${data.scheduled_time}`)
  y += 4

  // Customer section
  sectionHeader(doc, y, 'Customer')
  y += 7
  y = labelValue(doc, y, 'Name', data.customerName || '\u2014', { boldValue: true })
  const location = [data.address, data.lga].filter(Boolean).join(', ')
  y = labelValue(doc, y, 'Location', location || '\u2014')
  y += 4

  // Payment section
  sectionHeader(doc, y, 'Payment')
  y += 7
  y = labelValue(doc, y, 'Call-out fee', formatNaira(data.price_ngn))

  if (data.quoted_total_ngn != null) {
    y = labelValue(doc, y, 'Quoted total', formatNaira(data.quoted_total_ngn), { boldValue: true })
    const topup = data.topup_owed_ngn ?? Math.max(0, data.quoted_total_ngn - data.price_ngn)
    if (topup > 0) {
      y = labelValue(doc, y, 'Top-up owed', formatNaira(topup), { valueColor: '#B85C00' })
    } else {
      y = labelValue(doc, y, 'Top-up', 'Paid in full', { valueColor: '#0F7A5C' })
    }
  }
  y += 4

  // Provider section
  sectionHeader(doc, y, 'Provider')
  y += 7
  y = labelValue(doc, y, 'Provider', data.providerName || 'Unassigned', { boldValue: true })
  y += 4

  // Notes section
  if (data.quote_notes) {
    sectionHeader(doc, y, 'Notes')
    y += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(DARK)
    const lines = doc.splitTextToSize(data.quote_notes, 170)
    doc.text(lines, 20, y)
    y += lines.length * 4.5 + 4
  }

  // Footer
  const footerY = Math.max(y + 10, 275)
  doc.setDrawColor('#D0D9D4')
  doc.setLineWidth(0.4)
  doc.line(20, footerY, 190, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(MUTED)
  const footerText = `Generated on ${formatTimestamp(new Date().toISOString())}  |  Everiithing.com`
  doc.text(footerText, 20, footerY + 5)

  doc.save(`booking-${ref(data.id)}.pdf`)
}

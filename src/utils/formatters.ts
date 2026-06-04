export function formatNGN(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG')}`
}

export function formatPhone(phone: string): string {
  if (phone.startsWith('0')) return `+234${phone.slice(1)}`
  if (phone.startsWith('+234')) return phone
  return `+234${phone}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '')
  return /^(?:\+234\d{10}|0\d{10})$/.test(cleaned)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidNIN(nin: string): boolean {
  return /^\d{11}$/.test(nin)
}

export function isFutureDate(date: string): boolean {
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d > today
}

export function isAtLeast24HoursAhead(date: string, time: string): boolean {
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  const scheduled = new Date(y, m - 1, d, h, min)
  const now = new Date()
  const diff = scheduled.getTime() - now.getTime()
  return diff >= 24 * 60 * 60 * 1000
}

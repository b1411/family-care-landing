import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ru'

dayjs.extend(relativeTime)
dayjs.locale('ru')

export function formatDate(date: string | Date, format = 'D MMMM YYYY'): string {
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('D MMM YYYY, HH:mm')
}

export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow()
}

export function formatAge(dob: string | Date): string {
  const birth = dayjs(dob)
  const now = dayjs()
  const months = now.diff(birth, 'month')
  const days = now.diff(birth.add(months, 'month'), 'day')

  if (months >= 12) {
    const years = Math.floor(months / 12)
    const remMonths = months % 12
    return remMonths > 0 ? `${years} г ${remMonths} мес` : `${years} г`
  }
  if (months > 0) {
    return days > 0 ? `${months} мес ${days} дн` : `${months} мес`
  }
  return `${days} дн`
}

export function formatGestationalWeek(lmpDate: string | Date): string {
  const lmp = dayjs(lmpDate)
  const now = dayjs()
  const totalDays = now.diff(lmp, 'day')
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7
  return `${weeks} нед ${days} дн`
}

export function calculateEDD(lmpDate: string | Date): string {
  return dayjs(lmpDate).add(280, 'day').format('YYYY-MM-DD')
}

export function formatCurrency(amount: number, currency = '₸'): string {
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ${currency}`
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
  }
  return phone
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

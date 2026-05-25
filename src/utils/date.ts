import type { WarrantyStatus } from '@/types'

export function calcWarrantyExpire(constructionDate: string, warrantyYears: number): string {
  const date = new Date(constructionDate)
  date.setFullYear(date.getFullYear() + warrantyYears)
  return date.toISOString().split('T')[0]
}

export function getWarrantyStatus(expireDate: string): WarrantyStatus {
  const now = new Date()
  const expire = new Date(expireDate)
  const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'expired'
  if (diffDays <= 30) return 'expiring'
  return 'valid'
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

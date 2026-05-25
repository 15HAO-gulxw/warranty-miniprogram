export interface WarrantyRecord {
  _id?: string
  warranty_no: string
  owner_name: string
  owner_phone: string
  license_plate: string
  vin: string
  car_model: string
  car_color: string
  product_brand: string
  product_series: string
  product_model: string
  construction_parts: string[]
  construction_date: string
  delivery_date: string
  warranty_years: number
  warranty_expire: string
  technician: string
  total_price: number
  product_images: string[]
  construction_images: string[]
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Admin {
  _id?: string
  openid: string
  name: string
  created_at?: string
}

export type QueryField = 'owner_phone' | 'warranty_no' | 'license_plate' | 'vin'

export type WarrantyStatus = 'valid' | 'expiring' | 'expired'

export interface QueryResult extends Omit<WarrantyRecord, 'owner_phone'> {
  owner_phone_masked: string
  status: WarrantyStatus
}

export interface DashboardData {
  total_records: number
  monthly_count: number
  trend: { month: string; count: number }[]
  product_distribution: { name: string; value: number }[]
  expiring_soon: WarrantyRecord[]
  followup_reminders: WarrantyRecord[]
}

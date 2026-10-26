export interface Merchant {
  id: string
  deviceId: string
  name: string
  address: string
  bankLast4: string
}

export interface Transaction {
  id: string
  voucherIds: string[]
  amount: number
  createdAt: string // ISO
  status: 'confirmed'
  payoutId: string
}

export type PayoutStatus = 'scheduled' | 'paid' | 'matched' | 'not_matched'

export interface Payout {
  id: string
  date: string // YYYY-MM-DD
  expected: number
  received?: number
  status: PayoutStatus
}

/** The mock "redemption database". Populated in Phase 3/4. */
export interface Voucher {
  id: string
  value: number
  expiry: string // YYYY-MM-DD
  usedAt?: string
  merchantId?: string
}

export interface Notification {
  id: string
  type: 'payout' | 'mismatch' | 'tip' | 'booking'
  createdAt: string
  read: boolean
  i18nKey: string
  params: Record<string, string | number>
}

export interface AmbassadorBooking {
  id: string
  date: string
  slot: string
  name: string
  phone: string
  note: string
  status: 'booked'
}

export interface Settings {
  soundOn: boolean
  hapticsOn: boolean
}

export interface AppState {
  version: 1
  /** Local date the seed was generated on; a new day triggers a fresh seed. */
  seededOn: string
  merchant: Merchant
  transactions: Transaction[]
  payouts: Payout[]
  vouchers: Voucher[]
  notifications: Notification[]
  bookings: AmbassadorBooking[]
  settings: Settings
}

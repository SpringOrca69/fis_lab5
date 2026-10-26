import { addDays, dateKey } from './dates'

export const SLOTS = ['am', 'pm1', 'pm2'] as const
export type Slot = (typeof SLOTS)[number]

/** Days an ambassador can be booked: tomorrow up to 7 days ahead. */
export function bookableDays(now: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => dateKey(addDays(now, i + 1)))
}

export function validatePhone(input: string): boolean {
  return input.replace(/[\s-]/g, '').replace(/^\+?65/, '').match(/^\d{8}$/) !== null
}

export const DEMO_NAME = 'Ah Seng'
export const DEMO_PHONE = '9000 0000'

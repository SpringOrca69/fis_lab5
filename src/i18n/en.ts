/** English is the source of truth. Every other dictionary must have exactly these keys. */
export const en = {
  'app.name': 'HeartPay',
  'app.disclaimer': 'Concept prototype. Not affiliated with CDC or GovTech.',

  'nav.label': 'Main menu',
  'nav.home': 'Home',
  'nav.pay': 'Pay',
  'nav.history': 'History',
  'nav.payout': 'Payout',
  'nav.stall': 'Stall',

  'header.notifications': 'Notifications',
  'header.unread': '{count} unread',

  'lang.label': 'Language',
  'lang.en': 'English',
  'lang.zh': '中文',
  'lang.ms': 'Bahasa Melayu',
  'lang.ta': 'தமிழ்',

  'common.laterPhase': 'This page is coming soon.',

  'foundations.title': 'Home',
  'foundations.todaySales': "Today's CDC sales",
  'foundations.payments': '{count} payments',
  'foundations.lastPayment': 'Last payment',
  'foundations.noPayments': 'No payments yet today',
  'foundations.paidTonight': 'Paid to your bank tonight at midnight',
  'foundations.mismatchDay': 'Not matched, {amount} missing',
  'foundations.resetDemo': 'Reset demo data',

  'notif.mismatch': 'Payout for {date} is short by {amount}.',
  'notif.payout': 'Payment for {date}: {amount} paid to your bank.',
} as const

export type TranslationKey = keyof typeof en
export type Dictionary = Record<TranslationKey, string>

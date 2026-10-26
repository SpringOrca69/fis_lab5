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

  'common.back': 'Back',
  'common.tryAgain': 'Try again',
  'common.getHelp': 'Get help',

  'login.chooseLanguage': 'Choose your language',
  'login.singpass': 'Log in with Singpass (demo)',
  'login.loggingIn': 'Logging in…',
  'login.trouble': 'Trouble logging in?',
  'login.failTitle': 'Singpass login trouble',
  'login.failBody': "We couldn't log you in. Nothing has changed. Check your internet, then try again.",
  'login.existingOnly': 'For existing HeartPay shops only. Ask an ambassador to join.',
  'login.needHelp': 'Need help? Call {phone}',
  'login.hours': 'Daily 8am–10pm',
  'login.tagline': 'CDC vouchers made simple',

  'home.title': 'Home',
  'home.loading': 'Loading today’s sales',
  'home.todaySales': "Today's CDC sales",
  'home.payments.one': '{count} payment',
  'home.payments.other': '{count} payments',
  'home.lastPayment': 'Last payment',
  'home.noPayments': 'No payments yet today',
  'home.noPaymentsHint': 'Your first payment will show here.',
  'home.paidTonight': 'Paid to your bank tonight at midnight',
  'home.accept': 'Accept CDC Payment',
  'home.acceptHint': "Scan the customer's QR code",
  'home.report': "Today's report",
  'home.reportHint': 'See every payment today',
  'home.help': 'Get help',
  'home.helpHint': 'Call a person, or learn how',

  'notif.mismatch': 'Payout for {date} is short by {amount}.',
  'notif.payout': 'Payment for {date}: {amount} paid to your bank.',
} as const

export type TranslationKey = keyof typeof en
/** Base names of plural keys: 'home.payments' exists when 'home.payments.other' does. */
export type PluralKey = Extract<TranslationKey, `${string}.other`> extends `${infer B}.other` ? B : never
export type Dictionary = Record<TranslationKey, string>

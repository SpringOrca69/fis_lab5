import { CalendarCheck, ChevronDown, CircleAlert, Phone, Play, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { AppShell } from '@/components/AppShell'
import { Disclosure } from '@/components/Accordion'
import { BackButton } from '@/components/BackButton'
import { useI18n } from '@/i18n/context'
import { HELPLINE } from '@/lib/constants'
import { LANGS } from '@/lib/format'
import { useIsOnline } from '@/lib/offline'
import { cn } from '@/lib/utils'

const TEL = `tel:${HELPLINE.replace(/\D/g, '')}`

const VIDEOS = [
  { id: 'accept', titleKey: 'help.video.accept', time: '1:30' },
  { id: 'fail', titleKey: 'help.video.fail', time: '1:15' },
] as const

function VideoCard({ id, title, time }: { id: string; title: string; time: string }) {
  const { t, lang } = useI18n()
  const online = useIsOnline()
  const [playing, setPlaying] = useState(false)
  return (
    <li className="rounded-control border-2 border-line bg-surface p-3" data-testid={`video-${id}`}>
      <p className="text-base font-bold">{title}</p>
      <p className="text-sm text-ink-muted">{time}</p>
      {playing && online ? (
        <video
          key={lang}
          className="mt-2 w-full rounded-control bg-brand-900"
          controls
          autoPlay
          playsInline
          preload="metadata"
          src={`/videos/${id}.mp4`}
        >
          <track kind="captions" src={`/captions/${id}.${lang}.vtt`} srcLang={lang} label={t(`lang.${lang}`)} default />
          {t('help.video.noSupport')}
        </video>
      ) : (
        <button
          type="button"
          disabled={!online}
          onClick={() => setPlaying(true)}
          className="mt-2 flex min-h-tap-pay w-full items-center justify-center gap-2 rounded-control bg-brand-700 px-4 text-base font-bold text-white disabled:bg-line disabled:text-ink"
        >
          {online ? <Play aria-hidden className="size-6" /> : <WifiOff aria-hidden className="size-6" />}
          {online ? t('help.video.play') : t('help.video.needsInternet')}
        </button>
      )}
      <p className="mt-2 text-sm text-ink-muted">{t('help.video.placeholder')}</p>
    </li>
  )
}

/** Screen 6. Top: call, book, videos. Lower, collapsed: questions and the scam notice. */
export default function Help() {
  const { t, lang, setLang } = useI18n()
  const [more, setMore] = useState(false)
  // Keep the phone number on one line; the words around it may wrap in longer languages.
  const [callBefore, callAfter] = t('help.call.button', { phone: '\u0001' }).split('\u0001')

  return (
    <AppShell title={t('help.title')}>
      <BackButton />
      <div className="flex flex-col gap-5">
        <section aria-labelledby="call-h" className="rounded-card bg-surface p-5 shadow-card">
          <h2 id="call-h" className="text-lg font-bold">
            {t('help.call.title')}
          </h2>
          <a
            href={TEL}
            className="mt-3 flex min-h-tap-pay items-center justify-center gap-3 rounded-control bg-brand-700 px-4 text-lg font-bold text-white"
          >
            <Phone aria-hidden className="size-6" />
            <span className="text-center">
              {callBefore}
              <span className="whitespace-nowrap">{HELPLINE}</span>
              {callAfter}
            </span>
          </a>
          <p className="mt-3 text-base font-bold">{t('help.call.hours')}</p>
          <p className="text-base text-ink-muted">{t('help.call.languages')}</p>
          <div role="group" aria-label={t('help.lang.title')} className="mt-3 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                lang={l}
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  'min-h-tap rounded-full border-2 px-4 text-base font-bold',
                  lang === l ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-surface text-ink',
                )}
              >
                {lang === l ? '✓ ' : ''}
                {t(`lang.${l}`)}
              </button>
            ))}
          </div>
        </section>

        <Link
          to="/help/book"
          className="flex min-h-tap-pay items-center gap-3 rounded-card border-2 border-brand-700 bg-surface px-4 py-3 shadow-card"
        >
          <CalendarCheck aria-hidden className="size-8 shrink-0 text-brand-700" />
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold">{t('help.book.title')}</span>
            <span className="block text-base text-ink-muted">{t('help.book.hint')}</span>
          </span>
        </Link>

        <section aria-labelledby="vid-h">
          <h2 id="vid-h" className="mb-2 text-lg font-bold">
            {t('help.videos.title')}
          </h2>
          <ul className="flex flex-col gap-3">
            {VIDEOS.map((v) => (
              <VideoCard key={v.id} id={v.id} title={t(v.titleKey)} time={v.time} />
            ))}
          </ul>
        </section>

        <section aria-label={t('help.more.show')}>
          <button
            type="button"
            aria-expanded={more}
            aria-controls="more-help"
            onClick={() => setMore((m) => !m)}
            className="flex min-h-tap-pay w-full items-center justify-between gap-3 rounded-control border-2 border-line bg-surface px-4 text-left text-base font-bold"
          >
            {more ? t('help.more.hide') : t('help.more.show')}
            <ChevronDown aria-hidden className={cn('size-6 shrink-0 text-brand-700 transition-transform', more && 'rotate-180')} />
          </button>
          <div id="more-help" hidden={!more} className="mt-3 flex flex-col gap-4">
            <div className="rounded-card bg-surface px-4 py-2 shadow-card">
              <h2 className="py-2 text-lg font-bold">{t('help.faq.title')}</h2>
              {(['payout', 'singpass', 'lost'] as const).map((k) => (
                <Disclosure key={k} title={t(`help.faq.${k}.q`)} className="border-t border-line">
                  <p>{t(`help.faq.${k}.a`, { phone: HELPLINE })}</p>
                </Disclosure>
              ))}
            </div>
            <div className="rounded-card border-2 border-warning bg-warning-tint p-4" data-testid="scam-notice">
              <h2 className="flex items-center gap-2 text-lg font-bold text-warning">
                <CircleAlert aria-hidden className="size-6 shrink-0" />
                {t('help.scam.title')}
              </h2>
              <p className="mt-1 inline-block rounded-full bg-surface px-3 text-sm font-bold text-warning">{t('help.scam.tag')}</p>
              <p className="mt-2 text-base">{t('help.scam.body', { phone: HELPLINE })}</p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

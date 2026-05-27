import { inject } from '@nano_kit/store'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import {
  Link,
  Outlet,
  lang,
  meta,
  title,
  useLinkComponentAriaCurrent,
  useLinkComponentPreload,
  useSyncHead
} from '@nano_kit/preact-router'
import { text } from '@nano_kit/intl'
import { Intl$ } from '#src/stores/intl.ts'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('layout', {
    title: text(),
    events: text(),
    newEvent: text(),
    language: text(),
    loading: text()
  })
}

export function Stores$() {
  const [$t] = inject(Messages$)

  return [$t]
}

export function Head$() {
  const { $locale } = inject(Intl$)
  const [$t] = inject(Messages$)

  return [
    lang($locale),
    title($t.$title),
    meta({
      charSet: 'utf-8'
    }),
    meta({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    })
  ]
}

export default function Layout() {
  const {
    $locale,
    supportedLocales
  } = useInject(Intl$)
  const [$t, $messagesPending] = useInject(Messages$)
  const locale = useSignal($locale)
  const messagesPending = useSignal($messagesPending)
  const t = useSignal($t)

  useSyncHead()
  useLinkComponentPreload(true)
  useLinkComponentAriaCurrent()

  return (
    <div
      className='app message-block'
      aria-busy={messagesPending}
    >
      <header className='header'>
        <div className='container header__inner'>
          <Link to='home' className='brand'>
            {t.title}
          </Link>

          <nav className='nav'>
            <Link to='home'>{t.events}</Link>
            <Link to='newEvent'>{t.newEvent}</Link>
          </nav>
        </div>
      </header>

      <main className='container main'>
        <Outlet />
      </main>

      <footer className='footer'>
        <div className='container footer__inner'>
          <div className='locale-field'>
            <span>{t.language}</span>

            <div className='locale-switcher' role='group' aria-label={t.language}>
              {supportedLocales.map(supportedLocale => (
                <button
                  key={supportedLocale}
                  className='locale-switcher__button'
                  type='button'
                  aria-pressed={locale === supportedLocale}
                  onClick={() => $locale(supportedLocale)}
                >
                  {supportedLocale.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {messagesPending && (
        <div className='message-block__overlay' role='status' aria-live='polite'>
          <div className='loading-overlay__content'>
            <span className='loading-overlay__spinner' aria-hidden='true' />
            <span>{t.loading}</span>
          </div>
        </div>
      )}
    </div>
  )
}

import { inject } from '@nano_kit/store'
import {
  useInject,
  useSignal
} from '@nano_kit/react'
import {
  Link,
  Outlet,
  lang,
  meta,
  title,
  useLinkComponentAriaCurrent,
  useLinkComponentPreload,
  useSyncHead
} from '@nano_kit/react-router'
import { Intl$ } from '#src/stores/intl'
import { User$ } from '#src/stores/user'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('layout')
}

export function Stores$() {
  const [$t] = inject(Messages$)
  const { $user } = inject(User$)

  return [$t, $user]
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
    $loading,
    supportedLocales
  } = useInject(Intl$)
  const {
    $user,
    logout
  } = useInject(User$)
  const [$t] = useInject(Messages$)
  const locale = useSignal($locale)
  const loading = useSignal($loading)
  const user = useSignal($user)
  const t = useSignal($t)
  const onLogout = () => {
    void logout()
  }

  useSyncHead()
  useLinkComponentPreload(true)
  useLinkComponentAriaCurrent()

  return (
    <div className='app'>
      <header className='header'>
        <div className='container header__inner'>
          <Link to='home' className='brand'>
            {t.title}
          </Link>

          <nav className='nav'>
            <Link to='home'>{t.events}</Link>
            <Link to='newEvent'>{t.newEvent}</Link>
          </nav>

          <div className='header__user'>
            {user
              ? (
                <>
                  <strong>{user.name}</strong>
                  <button className='button_link' type='button' onClick={onLogout}>
                    {t.logout}
                  </button>
                </>
              )
              : <Link to='login'>{t.login}</Link>}
          </div>
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

      {loading && (
        <div className='loading-overlay' role='status' aria-live='polite'>
          <div className='loading-overlay__content'>
            <span className='loading-overlay__spinner' aria-hidden='true' />
            <span>{t.loading}</span>
          </div>
        </div>
      )}
    </div>
  )
}

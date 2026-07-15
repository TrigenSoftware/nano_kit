import type { TargetedEvent } from 'preact'
import {
  useInject,
  useSignal
} from '@nano_kit/preact'
import { title } from '@nano_kit/preact-router'
import { inject } from '@nano_kit/store'
import {
  match,
  other,
  text
} from '@nano_kit/intl'
import { UserError } from '#src/services/user'
import { User$ } from '#src/stores/user'
import { Intl$ } from '#src/stores/intl'

function Messages$() {
  const { messages } = inject(Intl$)

  return messages('login', {
    pageTitle: text(),
    eyebrow: text(),
    title: text(),
    description: text(),
    usernameLabel: text(),
    passwordLabel: text(),
    demoHint: text(),
    submitting: text(),
    submit: text(),
    errors: match('type', other(UserError.LoginFailed))
  })
}

export function Stores$() {
  const [$t] = inject(Messages$)

  return [$t]
}

export function Head$() {
  const [$t] = inject(Messages$)

  return [
    title($t.$pageTitle)
  ]
}

export default function LoginPage() {
  const {
    login,
    $loginError,
    $loginLoading
  } = useInject(User$)
  const [$t, $messagesPending] = useInject(Messages$)
  const t = useSignal($t)
  const messagesPending = useSignal($messagesPending)
  const error = useSignal($loginError)
  const loading = useSignal($loginLoading)
  const onSubmit = (event: TargetedEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')

    void login({
      username: typeof username === 'string' ? username : '',
      password: typeof password === 'string' ? password : ''
    })
  }

  return (
    <section
      className='page message-block'
      aria-busy={messagesPending}
    >
      <div className='page__header'>
        <p className='eyebrow'>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>
          {t.description}
        </p>
        <p className='shortcut-hint'>
          {t.demoHint}
        </p>
      </div>

      <form className='form' onSubmit={onSubmit}>
        <label className='field' htmlFor='login-username'>
          <span>{t.usernameLabel}</span>
          <input
            id='login-username'
            name='username'
            type='text'
            autoComplete='username'
            required
          />
        </label>

        <label className='field' htmlFor='login-password'>
          <span>{t.passwordLabel}</span>
          <input
            id='login-password'
            name='password'
            type='password'
            autoComplete='current-password'
            required
          />
        </label>

        {error && (
          <div className='notice notice_error'>
            {t.errors(error)}
          </div>
        )}

        <button className='button' type='submit' disabled={loading}>
          {loading ? t.submitting : t.submit}
        </button>
      </form>

      {messagesPending && (
        <div className='message-block__overlay' role='status' aria-live='polite'>
          <div className='loading-overlay__content'>
            <span className='loading-overlay__spinner' aria-hidden='true' />
          </div>
        </div>
      )}
    </section>
  )
}

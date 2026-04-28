import {
  type FormEvent,
  useState
} from 'react'
import {
  useInject,
  useSignal
} from '@nano_kit/react'
import {
  meta,
  title,
  usePaths
} from '@nano_kit/react-router'
import { Session$ } from '#src/stores/session'

export function Head$() {
  return [
    title('Session Cookies | Nano Kit SSR'),
    meta({
      name: 'description',
      content: 'Cookie-backed session demo rendered with Nano Kit SSR.'
    })
  ]
}

export default function Home() {
  const paths = usePaths()
  const {
    $username,
    login
  } = useInject(Session$)
  const username = useSignal($username)
  const [input, setInput] = useState('')
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    login(input)
    setInput('')
  }

  return (
    <section className='session'>
      <p className='eyebrow'>Cookie SSR demo</p>
      <h1>Session state without hydration mismatch</h1>
      <p className='intro'>
        The server reads the incoming cookie before rendering. The client hydrates the same session value.
      </p>

      {username
        ? (
          <div className='panel' aria-live='polite'>
            <p className='label'>Active session</p>
            <strong>{username}</strong>
            <a className='button' href={paths.logout}>
              Logout
            </a>
          </div>
        )
        : (
          <form className='panel form' onSubmit={onSubmit}>
            <label htmlFor='username'>
              Username
            </label>
            <input
              id='username'
              name='username'
              value={input}
              onChange={event => setInput(event.currentTarget.value)}
              autoComplete='username'
              required
            />
            <button type='submit'>
              Start session
            </button>
          </form>
        )}
    </section>
  )
}

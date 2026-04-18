import {
  Link,
  Outlet,
  meta,
  title,
  useLinkComponentAriaCurrent,
  useLinkComponentPreload,
  useSyncHead
} from '@nano_kit/react-router'

export function Head$() {
  return [
    title('Event Board'),
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
  useSyncHead()
  useLinkComponentPreload(true)
  useLinkComponentAriaCurrent()

  return (
    <div className='app'>
      <header className='header'>
        <div className='container header__inner'>
          <Link to='home' className='brand'>
            Event Board
          </Link>

          <nav className='nav'>
            <Link to='home'>Events</Link>
            <Link to='newEvent'>New event</Link>
          </nav>
        </div>
      </header>

      <main className='container main'>
        <Outlet />
      </main>
    </div>
  )
}

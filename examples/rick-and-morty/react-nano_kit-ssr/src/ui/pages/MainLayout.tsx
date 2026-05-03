import {
  Link,
  Outlet,
  useSyncHead,
  useLinkComponentPreload,
  useLinkComponentAriaCurrent,
  meta,
  title
} from '@nano_kit/react-router'

export function Head$() {
  return [
    title('Rick and Morty Wiki'),
    meta({
      charSet: 'utf-8'
    }),
    meta({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    })
  ]
}

export default function MainLayout() {
  useSyncHead()
  useLinkComponentPreload(true)
  useLinkComponentAriaCurrent()

  return (
    <div className='main-layout-app'>
      <header className='main-layout-header'>
        <div className='main-layout-container'>
          <h1 className='main-layout-title'>
            <span className='main-layout-logo'>🛸</span>
            Rick and Morty
          </h1>

          <nav className='main-layout-nav'>
            <Link to='characters' className='main-layout-nav-link'>
              Characters
            </Link>
            <Link to='locations' className='main-layout-nav-link'>
              Locations
            </Link>
            <Link to='episodes' className='main-layout-nav-link'>
              Episodes
            </Link>
          </nav>
        </div>
      </header>

      <main className='main-layout-main'>
        <Outlet />
      </main>
    </div>
  )
}

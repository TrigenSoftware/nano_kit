import {
  Link,
  Outlet,
  useLocation
} from '@tanstack/react-router'
import clsx from 'clsx'

export function MainLayout() {
  const location = useLocation()

  return (
    <div className='main-layout-app'>
      <header className='main-layout-header'>
        <div className='main-layout-container'>
          <h1 className='main-layout-title'>
            <span className='main-layout-logo'>🛸</span>
            Rick and Morty
          </h1>

          <nav className='main-layout-nav'>
            <Link
              to='/characters'
              search={{
                page: 1
              }}
              className={clsx('main-layout-nav-link', location.pathname === '/characters' && 'main-layout-active')}
            >
              Characters
            </Link>
            <Link
              to='/locations'
              search={{
                page: 1
              }}
              className={clsx('main-layout-nav-link', location.pathname === '/locations' && 'main-layout-active')}
            >
              Locations
            </Link>
            <Link
              to='/episodes'
              search={{
                page: 1
              }}
              className={clsx('main-layout-nav-link', location.pathname === '/episodes' && 'main-layout-active')}
            >
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

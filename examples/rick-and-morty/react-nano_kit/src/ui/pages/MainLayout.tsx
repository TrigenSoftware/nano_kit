import { Outlet } from '@nano_kit/react-router'
import { Link } from '#src/ui/components/Link'

export function MainLayout() {
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

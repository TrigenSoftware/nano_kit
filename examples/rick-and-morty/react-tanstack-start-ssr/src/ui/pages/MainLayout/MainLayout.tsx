import { Link, Outlet, useLocation } from '@tanstack/react-router'
import clsx from 'clsx'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const location = useLocation()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            <span className={styles.logo}>🛸</span>
            Rick and Morty
          </h1>

          <nav className={styles.nav}>
            <Link
              to='/characters'
              search={{
                page: 1
              }}
              className={clsx(styles.navLink, location.pathname === '/characters' && styles.active)}
            >
              Characters
            </Link>
            <Link
              to='/locations'
              search={{
                page: 1
              }}
              className={clsx(styles.navLink, location.pathname === '/locations' && styles.active)}
            >
              Locations
            </Link>
            <Link
              to='/episodes'
              search={{
                page: 1
              }}
              className={clsx(styles.navLink, location.pathname === '/episodes' && styles.active)}
            >
              Episodes
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

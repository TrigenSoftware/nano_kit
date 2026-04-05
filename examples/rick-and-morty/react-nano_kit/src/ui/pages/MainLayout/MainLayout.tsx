import { Outlet } from '@nano_kit/react-router'
import { Link } from '#src/ui/components/Link'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            <span className={styles.logo}>🛸</span>
            Rick and Morty
          </h1>

          <nav className={styles.nav}>
            <Link to='characters' className={styles.navLink}>
              Characters
            </Link>
            <Link to='locations' className={styles.navLink}>
              Locations
            </Link>
            <Link to='episodes' className={styles.navLink}>
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

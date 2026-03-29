/* DISCLAIMER! VIBECODED! */
'use client'
import { useSignal, useInject } from '@nano_kit/react'
import { Location$, Link } from '@nano_kit/next-router'
import clsx from 'clsx'
import styles from './Header.module.css'

export function Header() {
  const $location = useInject(Location$)
  const { route } = useSignal($location)

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span className={styles.logo}>🛸</span>
          Rick and Morty
        </h1>

        <nav className={styles.nav}>
          <Link
            className={clsx(styles.navLink, route === 'characters' && styles.active)}
            to='characters'
          >
            Characters
          </Link>
          <Link
            className={clsx(styles.navLink, route === 'locations' && styles.active)}
            to='locations'
          >
            Locations
          </Link>
          <Link
            className={clsx(styles.navLink, route === 'episodes' && styles.active)}
            to='episodes'
          >
            Episodes
          </Link>
        </nav>
      </div>
    </header>
  )
}

/* DISCLAIMER! VIBECODED! */
'use client'
import { useSignal, useInject } from '@nano_kit/react'
import {
  Location$,
  Paths$,
  useListenLinks
} from '@nano_kit/next-router'
import clsx from 'clsx'
import styles from './Header.module.css'

export function Header() {
  const $location = useInject(Location$)
  const paths = useInject(Paths$)
  const { route } = useSignal($location)

  useListenLinks()

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span className={styles.logo}>🛸</span>
          Rick and Morty
        </h1>

        <nav className={styles.nav}>
          <a
            href={paths.characters}
            className={clsx(styles.navLink, route === 'characters' && styles.active)}
          >
            Characters
          </a>
          <a
            href={paths.locations}
            className={clsx(styles.navLink, route === 'locations' && styles.active)}
          >
            Locations
          </a>
          <a
            href={paths.episodes}
            className={clsx(styles.navLink, route === 'episodes' && styles.active)}
          >
            Episodes
          </a>
        </nav>
      </div>
    </header>
  )
}

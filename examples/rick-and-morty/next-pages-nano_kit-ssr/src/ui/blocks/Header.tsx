/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import {
  Location$,
  Paths$,
  useListenLinks
} from '@nano_kit/next-router'
import clsx from 'clsx'

export function Header() {
  const $location = useInject(Location$)
  const paths = useInject(Paths$)
  const { route } = useSignal($location)

  useListenLinks()

  return (
    <header className='header-header'>
      <div className='header-container'>
        <h1 className='header-title'>
          <span className='header-logo'>🛸</span>
          Rick and Morty
        </h1>

        <nav className='header-nav'>
          <a
            href={paths.characters}
            className={clsx('header-nav-link', route === 'characters' && 'header-active')}
          >
            Characters
          </a>
          <a
            href={paths.locations}
            className={clsx('header-nav-link', route === 'locations' && 'header-active')}
          >
            Locations
          </a>
          <a
            href={paths.episodes}
            className={clsx('header-nav-link', route === 'episodes' && 'header-active')}
          >
            Episodes
          </a>
        </nav>
      </div>
    </header>
  )
}

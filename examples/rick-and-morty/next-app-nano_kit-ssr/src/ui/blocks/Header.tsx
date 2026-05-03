/* DISCLAIMER! VIBECODED! */
'use client'
import { useSignal, useInject } from '@nano_kit/react'
import { Location$, Link } from '@nano_kit/next-router'
import clsx from 'clsx'

export function Header() {
  const $location = useInject(Location$)
  const { route } = useSignal($location)

  return (
    <header className='header-header'>
      <div className='header-container'>
        <h1 className='header-title'>
          <span className='header-logo'>🛸</span>
          Rick and Morty
        </h1>

        <nav className='header-nav'>
          <Link
            className={clsx('header-nav-link', route === 'characters' && 'header-active')}
            to='characters'
          >
            Characters
          </Link>
          <Link
            className={clsx('header-nav-link', route === 'locations' && 'header-active')}
            to='locations'
          >
            Locations
          </Link>
          <Link
            className={clsx('header-nav-link', route === 'episodes' && 'header-active')}
            to='episodes'
          >
            Episodes
          </Link>
        </nav>
      </div>
    </header>
  )
}

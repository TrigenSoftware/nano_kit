/* DISCLAIMER! VIBECODED! */
'use client'
import clsx from 'clsx'
import { useInject } from '@nano_kit/react'
import { Paths$ } from '@nano_kit/router'
import type { Character } from '@/services/api'

export interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  const paths = useInject(Paths$)
  const characterUrl = paths.character({
    id: character.id
  })

  return (
    <article className='character-card-card'>
      <a href={characterUrl} className='character-card-link'>
        <div className='character-card-image-wrapper'>
          <img
            src={character.image}
            alt={character.name}
            className='character-card-image'
            loading='lazy'
          />
        </div>

        <div className='character-card-content'>
          <h2 className='character-card-name'>{character.name}</h2>

          <div className='character-card-info'>
            <div className='character-card-row'>
              <span className='character-card-label'>Status:</span>
              <span className={clsx('character-card-status', `character-card-status--${character.status.toLowerCase()}`)}>
                {character.status}
              </span>
            </div>

            <div className='character-card-row'>
              <span className='character-card-label'>Species:</span>
              <span className='character-card-value'>{character.species}</span>
            </div>

            <div className='character-card-row'>
              <span className='character-card-label'>Gender:</span>
              <span className='character-card-value'>{character.gender}</span>
            </div>

            <div className='character-card-row'>
              <span className='character-card-label'>Origin:</span>
              <span className='character-card-value'>{character.origin.name}</span>
            </div>

            <div className='character-card-row'>
              <span className='character-card-label'>Location:</span>
              <span className='character-card-value'>{character.location.name}</span>
            </div>

            <div className='character-card-row'>
              <span className='character-card-label'>Episodes:</span>
              <span className='character-card-value'>{character.episode.length}</span>
            </div>
          </div>
        </div>
      </a>
    </article>
  )
}

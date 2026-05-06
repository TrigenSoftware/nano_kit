/* DISCLAIMER! VIBECODED! */
import { useSignal } from '@nano_kit/react'
import { $character } from '#src/stores/characters'

export function CharacterDetail() {
  const character = useSignal($character)

  if (!character) {
    return null
  }

  return (
    <div className='character-detail-container'>
      <div className='character-detail-header'>
        <img
          src={character.image}
          alt={character.name}
          className='character-detail-image'
        />
        <div className='character-detail-info'>
          <h1 className='character-detail-name'>{character.name}</h1>
          <div className='character-detail-status'>
            <span className={`character-detail-status-indicator character-detail-${character.status.toLowerCase()}`} />
            {character.status} - {character.species}
          </div>
          {character.type
            && <p className='character-detail-type'>Type: {character.type}</p>
          }
          <p className='character-detail-gender'>Gender: {character.gender}</p>
        </div>
      </div>

      <div className='character-detail-details'>
        <div className='character-detail-section'>
          <h2>Origin</h2>
          <p>{character.origin.name}</p>
        </div>

        <div className='character-detail-section'>
          <h2>Last known location</h2>
          <p>{character.location.name}</p>
        </div>

        <div className='character-detail-section'>
          <h2>Episodes</h2>
          <p>{character.episode.length} episodes</p>
        </div>
      </div>
    </div>
  )
}

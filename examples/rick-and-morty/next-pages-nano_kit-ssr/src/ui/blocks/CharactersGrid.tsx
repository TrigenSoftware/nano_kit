/* DISCLAIMER! VIBECODED! */
'use client'
import { type Character } from '@/services/api'
import { CharacterCard } from '@/ui/blocks/CharacterCard'

export interface CharactersGridProps {
  characters: Character[]
}

export function CharactersGrid({ characters }: CharactersGridProps) {
  return (
    <div className='characters-grid-grid'>
      {characters.map(character => (
        <CharacterCard
          key={character.id}
          character={character}
        />
      ))}
    </div>
  )
}

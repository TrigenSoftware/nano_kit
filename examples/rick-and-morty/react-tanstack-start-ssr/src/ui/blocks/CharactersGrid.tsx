/* DISCLAIMER! VIBECODED! */
import { type Character } from '#src/services/api'
import { CharacterCard } from '#src/ui/blocks/CharacterCard'

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

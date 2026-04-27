/* DISCLAIMER! VIBECODED! */
import { type Character } from '#src/services/api'
import { CharacterCard } from '#src/ui/blocks/CharacterCard'
import styles from './CharactersGrid.module.css'

export interface CharactersGridProps {
  characters: Character[]
}

export function CharactersGrid({ characters }: CharactersGridProps) {
  return (
    <div className={styles.grid}>
      {characters.map(character => (
        <CharacterCard
          key={character.id}
          character={character}
        />
      ))}
    </div>
  )
}

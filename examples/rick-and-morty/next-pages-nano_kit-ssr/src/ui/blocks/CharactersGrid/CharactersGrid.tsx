/* DISCLAIMER! VIBECODED! */
'use client'
import { type Character } from '@/services/api'
import { CharacterCard } from '@/ui/blocks/CharacterCard'
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

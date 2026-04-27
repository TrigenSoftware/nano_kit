/* DISCLAIMER! VIBECODED! */
import type { Character } from '#src/services/api'
import styles from './CharacterDetail.module.css'

export interface CharacterDetailProps {
  character: Character
}

export function CharacterDetail({ character }: CharacterDetailProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={character.image}
          alt={character.name}
          className={styles.image}
        />
        <div className={styles.info}>
          <h1 className={styles.name}>{character.name}</h1>
          <div className={styles.status}>
            <span className={`${styles.statusIndicator} ${styles[character.status.toLowerCase()]}`} />
            {character.status} - {character.species}
          </div>
          {character.type
            && <p className={styles.type}>Type: {character.type}</p>
          }
          <p className={styles.gender}>Gender: {character.gender}</p>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.section}>
          <h2>Origin</h2>
          <p>{character.origin.name}</p>
        </div>

        <div className={styles.section}>
          <h2>Last known location</h2>
          <p>{character.location.name}</p>
        </div>

        <div className={styles.section}>
          <h2>Episodes</h2>
          <p>{character.episode.length} episodes</p>
        </div>
      </div>
    </div>
  )
}

/* DISCLAIMER! VIBECODED! */
import clsx from 'clsx'
import { Link } from '@tanstack/react-router'
import { type Character } from '#src/services/api'
import styles from './CharacterCard.module.css'

export interface CharacterCardProps {
  character: Character
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <article className={styles.card}>
      <Link to='/character/$characterId' params={{
        characterId: character.id
      }} className={styles.link}>
        <div className={styles.imageWrapper}>
          <img
            src={character.image}
            alt={character.name}
            className={styles.image}
            loading='lazy'
          />
        </div>

        <div className={styles.content}>
          <h2 className={styles.name}>{character.name}</h2>

          <div className={styles.info}>
            <div className={styles.row}>
              <span className={styles.label}>Status:</span>
              <span className={clsx(styles.status, styles[`status--${character.status.toLowerCase()}`])}>
                {character.status}
              </span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Species:</span>
              <span className={styles.value}>{character.species}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Gender:</span>
              <span className={styles.value}>{character.gender}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Origin:</span>
              <span className={styles.value}>{character.origin.name}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{character.location.name}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Episodes:</span>
              <span className={styles.value}>{character.episode.length}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

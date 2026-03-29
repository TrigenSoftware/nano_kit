/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Location$ } from '@/stores/locations'
import { Residents$ } from '@/stores/characters'
import { LocationDetail } from '@/ui/blocks/LocationDetail'
import { CharactersGrid } from '@/ui/blocks/CharactersGrid'
import { Spinner } from '@/ui/components/Spinner'
import styles from './Location.module.css'

export default function Location() {
  const {
    $locationError,
    $locationLoading
  } = useInject(Location$)
  const { $residents } = useInject(Residents$)
  const residents = useSignal($residents)
  const error = useSignal($locationError)
  const loading = useSignal($locationLoading)

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading location</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (loading || !residents) {
    return <Spinner>Loading location...</Spinner>
  }

  return (
    <section className={styles.container}>
      <LocationDetail />

      <div className={styles.residentsSection}>
        <h2 id='residents' className={styles.residentsTitle}>
          <a href='#residents'>Residents ({residents.length})</a>
        </h2>
        <CharactersGrid characters={residents} />
      </div>
    </section>
  )
}

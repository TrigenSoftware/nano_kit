import type { Accessor } from '@nano_kit/store'
import { createContext } from 'svelte'
import type { PageComponent } from './types.js'

/**
 * Get current outlet signal from Svelte context.
 * @returns The current outlet signal.
 */
export const [
  getOutlet,
  setOutlet
] = createContext<Accessor<PageComponent | null>>()

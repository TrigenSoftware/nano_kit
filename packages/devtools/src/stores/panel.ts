import { signal } from '@nano_kit/store'

export type PanelTab = 'signals' | 'log'

/**
 * What the panel as a whole is set to: the open tab and the text of the filter field.
 * @returns The store.
 */
export function PanelStore$() {
  const $tab = signal<PanelTab>('signals')
  const $filter = signal('')

  return {
    $tab,
    $filter
  }
}

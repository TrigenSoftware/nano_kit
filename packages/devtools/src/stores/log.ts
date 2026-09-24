import {
  signal,
  mountable,
  onMount,
  action,
  inject
} from '@nano_kit/store'
import {
  type InspectorEvent,
  InspectorService$
} from '../services/inspector/index.js'
import {
  type LogGroup,
  groupEvents
} from '../services/log/index.js'
import { RegistryStore$ } from './registry.js'

/**
 * The transactions the log keeps. The oldest leave as new ones come.
 */
export const LOG_GROUPS = 200

/**
 * The log of the Log tab: the transactions of the application, a group per flush, newest first.
 * It listens while somebody reads its groups, after the registry it names the nodes by: the panel
 * reads the records from the start, so the registry is the first to listen.
 * @returns The store.
 */
export function LogStore$() {
  const inspector = inject(InspectorService$)
  const { recordOf } = inject(RegistryStore$)
  const $groups = signal<LogGroup[]>([])
  const $paused = signal(false)
  // The number of the next group, counted on through a clear
  const numbers = {
    next: 1
  }
  const apply = (events: InspectorEvent[]) => {
    if (!$paused()) {
      const groups = groupEvents(events, recordOf, () => numbers.next++)

      if (groups.length) {
        $groups([...groups.reverse(), ...$groups()].slice(0, LOG_GROUPS))
      }
    }
  }
  /**
   * Stop adding to the log. The registry keeps following the graph.
   */
  const pause = action(() => {
    $paused(true)
  })
  /**
   * Add to the log again.
   */
  const resume = action(() => {
    $paused(false)
  })
  /**
   * Empty the log. The groups to come are numbered on.
   */
  const clear = action(() => {
    $groups([])
  })

  onMount(mountable($groups), () => inspector.listen(apply))

  return {
    $groups,
    $paused,
    pause,
    resume,
    clear
  }
}

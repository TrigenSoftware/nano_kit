import {
  type WritableSignal,
  external,
  mountable,
  onStart
} from '@nano_kit/store'

export type PermissionValue = PermissionState | Error | undefined

/**
 * Creates a signal for the current permission state.
 * @param nameOrDescriptor - Permission name or full permission descriptor.
 * @returns A signal containing the current permission state or an error.
 */
/* @__NO_SIDE_EFFECTS__ */
export function permission(
  nameOrDescriptor: string | PermissionDescriptor
): WritableSignal<PermissionValue> {
  return external<PermissionValue>(($permission) => {
    if (typeof window === 'undefined') {
      return
    }

    const descriptor = typeof nameOrDescriptor === 'string'
      ? {
        name: nameOrDescriptor as PermissionName
      }
      : nameOrDescriptor

    onStart(mountable($permission), () => {
      let ps: PermissionStatus | null = null

      void navigator.permissions.query(descriptor)
        // ;-)
        .then(result => ((ps = result).onchange = () => $permission(result.state))())
        .catch($permission)

      return () => {
        if (ps) {
          ps = ps.onchange = null
        }
      }
    })
  })
}

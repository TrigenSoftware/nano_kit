import type {
  AnySignal,
  ReadableSignal,
  Mountable,
  AnyWritableSignal,
  AnyReadableSignal,
  AnyAccessor,
  AccessorValue
} from './internals/types.js'
import {
  MountableMode,
  WritableMode
} from './internals/flags.js'
import { touchLifecycle } from './internals/system.js'

// Over-approximate on purpose: contagion marks every computed that ever
// linked a mountable dep, and the mark is a permanent latch
/* @__NO_SIDE_EFFECTS__ */
export function isMountable<T extends Mountable<AnySignal> = Mountable<AnySignal>>(value: AnyAccessor): value is T {
  return ((value as AnyWritableSignal).node?.modes & MountableMode) > 0
}

export function unsafeMarkMountable($signal: AnySignal) {
  $signal.node.modes |= MountableMode
}

/**
 * Mark a signal as mountable.
 * @param $signal
 * @returns The mountable signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mountable<T extends AnySignal>($signal: T): Mountable<T> {
  unsafeMarkMountable($signal)
  // A signal marked after it gained subscribers re-derives its level
  touchLifecycle($signal.node)

  return $signal as Mountable<T>
}

/* @__NO_SIDE_EFFECTS__ */
export function isWritable<T extends AnyWritableSignal = AnyWritableSignal>(value: AnyAccessor): value is T {
  return ((value as AnyWritableSignal).node?.modes & WritableMode) > 0
}

export function unsafeMarkWritable($signal: AnySignal) {
  $signal.node.modes |= WritableMode
}

/**
 * Mark a signal as readonly.
 * @param $signal
 * @returns The readonly signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function readonly<T extends AnyAccessor>($signal: T) {
  if (isWritable($signal)) {
    ($signal as AnyReadableSignal).node.modes &= ~WritableMode
  }

  return $signal as T extends Mountable<AnyWritableSignal>
    ? Mountable<ReadableSignal<AccessorValue<T>>>
    : T extends AnyWritableSignal
      ? ReadableSignal<AccessorValue<T>>
      : T
}

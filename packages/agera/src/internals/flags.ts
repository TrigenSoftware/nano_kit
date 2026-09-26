// #region Reactive flags
export const NoneFlag = 0

export const MutableFlag = 1 << 0

export const WatchingFlag = 1 << 1

export const RecursedCheckFlag = 1 << 2

export const RecursedFlag = 1 << 3

export const DirtyFlag = 1 << 4

export const PendingFlag = 1 << 5

// #endregion

// #region Mode flags
export const ScopeMode = 1 << 0

export const LazyMode = 1 << 1

export const WritableMode = 1 << 2

export const MountableMode = 1 << 3

export const PausedMode = 1 << 4

export const DeferredMode = 1 << 5

// Set by the development build only: `inspect` never reports such a node
export const UninspectedMode = 1 << 6

export const ExternalModesBase = 7

// #endregion

// #region Event kinds, passed to the `inspect` listener
export const LinkEvent = 0

export const UnlinkEvent = 1

export const UpdateEvent = 2

export const RunEvent = 3

export const StopEvent = 4

export const LifecycleEvent = 5

export const FlushEvent = 6

export const RunEndEvent = 7

export const FireEvent = 8

export const FireEndEvent = 9

// #endregion

'use client'
import {
  type Accessor,
  type InjectionProvider,
  type Injectable,
  InjectionContext,
  inject,
  effect
} from '@nano_kit/store'
import {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  createContext,
  useContext
} from 'react'

/**
 * Get signal store value and subscribe to changes.
 * @param $signal - The signal store.
 * @returns The signal store value.
 */
export function useSignal<T>($signal: Accessor<T>) {
  const snapshotRef = useRef(undefined as T)
  const sub = useCallback(
    (emit: () => void) => effect(() => {
      const value = $signal()

      if (snapshotRef.current !== value) {
        snapshotRef.current = value
        emit()
      }
    }),
    [$signal]
  )
  const get = () => snapshotRef.current

  snapshotRef.current = $signal()

  return useSyncExternalStore(sub, get, get)
}

export const ReactInjectionContext = /* @__PURE__ */ createContext<InjectionContext | undefined>(undefined)

/**
 * Get the current injection context.
 * @returns The current injection context.
 */
/* @__NO_SIDE_EFFECTS__ */
export function useInjectionContext() {
  return useContext(ReactInjectionContext)
}

/**
 * Inject a dependency.
 * @param injectable - The injectable function or class to create or get the dependency.
 * @returns The dependency.
 */
export function useInject<T>(injectable: Injectable<T>): T {
  const currentContext = useInjectionContext()
  const dependency = useMemo(
    () => inject(injectable, currentContext),
    [currentContext, injectable]
  )

  return dependency
}

/**
 * Create a hook to subscribe to a signal value.
 * @param getter - The function to get the signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function signalHook<T>(getter: () => Accessor<T>): () => T {
  return () => useSignal(getter())
}

/**
 * Create a hook to inject a dependency.
 * @param injectable - The injectable function or class to create or get the dependency.
 * @returns A hook function to get the dependency.
 */
/* @__NO_SIDE_EFFECTS__ */
export function injectHook<T>(injectable: Injectable<T>): () => T {
  return () => useInject(injectable)
}

export interface InjectionContextProps {
  context?: InjectionContext | InjectionProvider[]
  children: ReactNode
}

/**
 * Provide dependencies to children.
 * @param props
 * @param props.context - The dependencies to provide or InjectionContext instance.
 * @param props.children - The children to provide the dependencies to.
 * @returns The component.
 */
export function InjectionContextProvider({
  context,
  children
}: InjectionContextProps) {
  const currentContext = useInjectionContext()
  const contextRef = useRef<InjectionContext>(null)

  if (!context && currentContext) {
    return children
  }

  const value = contextRef.current ??= context instanceof InjectionContext
    ? context
    : new InjectionContext(context, currentContext)

  return (
    <ReactInjectionContext.Provider value={value}>
      {children}
    </ReactInjectionContext.Provider>
  )
}

export interface IsolateProps {
  children: ReactNode
}

/**
 * Isolate children to new isolated injection context.
 * @param props
 * @param props.children - The children to isolate.
 * @returns The component.
 */
export function Isolate({ children }: IsolateProps) {
  return (
    <ReactInjectionContext.Provider value={undefined}>
      {children}
    </ReactInjectionContext.Provider>
  )
}

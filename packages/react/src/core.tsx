'use client'
import {
  type Accessor,
  type InjectionProvider,
  type InjectionToken,
  Injector,
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

export const ReactInjectorContext = /* @__PURE__ */ createContext<Injector | undefined>(undefined)

/**
 * Get the current injector.
 * @returns The current injector.
 */
/* @__NO_SIDE_EFFECTS__ */
export function useInjector() {
  return useContext(ReactInjectorContext)
}

/**
 * Inject a dependency.
 * @param token - The invocable token to create or get the dependency.
 * @returns The dependency.
 */
export function useInject<T>(token: InjectionToken<T>): T {
  const currentInjector = useInjector()
  const dependency = useMemo(
    () => inject(token, currentInjector),
    [currentInjector, token]
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
 * @param token - The invocable token to create or get the dependency.
 * @returns A hook function to get the dependency.
 */
/* @__NO_SIDE_EFFECTS__ */
export function injectHook<T>(token: InjectionToken<T>): () => T {
  return () => useInject(token)
}

export interface InjectorProviderProps {
  injector?: Injector | InjectionProvider[]
  children: ReactNode
}

/**
 * Provide dependencies to children.
 * @param props
 * @param props.injector - The dependencies to provide or Injector instance.
 * @param props.children - The children to provide the dependencies to.
 * @returns The component.
 */
export function InjectorProvider({
  injector,
  children
}: InjectorProviderProps) {
  const currentInjector = useInjector()
  const injectorRef = useRef<Injector>(null)

  if (!injector && currentInjector) {
    return children
  }

  const value = injectorRef.current ??= injector instanceof Injector
    ? injector
    : new Injector(injector, currentInjector)

  return (
    <ReactInjectorContext.Provider value={value}>
      {children}
    </ReactInjectorContext.Provider>
  )
}

export interface IsolateProps {
  children: ReactNode
}

/**
 * Isolate children to new isolated injector.
 * @param props
 * @param props.children - The children to isolate.
 * @returns The component.
 */
export function Isolate({ children }: IsolateProps) {
  return (
    <ReactInjectorContext.Provider value={undefined}>
      {children}
    </ReactInjectorContext.Provider>
  )
}

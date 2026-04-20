import {
  type Accessor,
  type InjectionProvider,
  type InjectionFactory,
  InjectionContext,
  inject,
  effect
} from '@nano_kit/store'
import {
  type ComponentChildren,
  createContext
} from 'preact'
import {
  useCallback,
  useContext,
  useMemo,
  useRef
} from 'preact/hooks'
import { useSyncExternalStore } from 'preact/compat'

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

  return useSyncExternalStore(sub, get)
}

export const PreactInjectionContext = /* @__PURE__ */ createContext<InjectionContext | undefined>(undefined)

/**
 * Get the current injection context.
 * @returns The current injection context.
 */
/* @__NO_SIDE_EFFECTS__ */
export function useInjectionContext() {
  return useContext(PreactInjectionContext)
}

/**
 * Inject a dependency.
 * @param factory - The factory function to create or get the dependency.
 * @returns The dependency.
 */
export function useInject<T>(factory: InjectionFactory<T>): T {
  const currentContext = useInjectionContext()
  const dependency = useMemo(
    () => inject(factory, currentContext),
    [currentContext, factory]
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
 * @param factory - The factory function to create or get the dependency.
 * @returns A hook function to get the dependency.
 */
/* @__NO_SIDE_EFFECTS__ */
export function injectHook<T>(factory: InjectionFactory<T>): () => T {
  return () => useInject(factory)
}

export interface InjectionContextProps {
  context?: InjectionContext | InjectionProvider[]
  children: ComponentChildren
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
    <PreactInjectionContext.Provider value={value}>
      {children}
    </PreactInjectionContext.Provider>
  )
}

export interface IsolateProps {
  children: ComponentChildren
}

/**
 * Isolate children to new isolated injection context.
 * @param props
 * @param props.children - The children to isolate.
 * @returns The component.
 */
export function Isolate({ children }: IsolateProps) {
  return (
    <PreactInjectionContext.Provider value={undefined}>
      {children}
    </PreactInjectionContext.Provider>
  )
}

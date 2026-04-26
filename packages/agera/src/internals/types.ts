export type AnyFn = (...args: any) => any

export type DefineVirtualFlags<F extends string, V = unknown> = {
  [K in F as `~${K}`]?: V
}

export type EnableVirtualFlags<T, F extends string> = Omit<T, `~${F}`> & DefineVirtualFlags<F, true>

export type Destroy = () => void

export type MaybeDestroy = Destroy | void

export type EffectCallback = (warmup?: true) => MaybeDestroy

export type ObserverCallback<T> = (value: T) => void

export type Compute<T> = (prevValue?: T) => T

export type Accessor<T> = () => T

export type NewValue<T> = T | ((prevValue: T) => T)

export interface ReadableNode extends ReactiveNode, DefineVirtualFlags<'writable' | 'mountable'> {
  subsCount: number
  mounted?: WritableSignal<boolean>
}

export interface WritableNode extends EnableVirtualFlags<ReadableNode, 'writable'> {}

export interface ReadableSignal<T> extends Accessor<T> {
  node: ReadableNode
}

export interface Morph<T = unknown> {
  source: WritableSignal<T>
  get(): T
  set(value: NewValue<T>): void
}

export interface WritableSignal<T> extends ReadableSignal<T> {
  (value: NewValue<T>): void
  node: SignalNode<T>
}

export type AnyAccessor = Accessor<any>

export type AnyReadableSignal = ReadableSignal<any>

export type AnyWritableSignal = WritableSignal<any>

export type AnySignal = AnyReadableSignal | AnyWritableSignal

export type AnyAccessorOrSignal = AnyAccessor | AnySignal

export type AccessorValue<T> = T extends Accessor<infer U> ? U : never

export type MaybeAccessorValue<T> = T extends Accessor<infer U> ? U : T

export type Mountable<S extends AnySignal> = S & {
  node: EnableVirtualFlags<S['node'], 'mountable'>
}

export interface ReactiveNode {
  deps?: Link
  depsTail?: Link
  subs?: Link
  subsTail?: Link
  flags: number
  modes: number
  noMount?: ReactiveNode
}

export interface Link {
  version: number
  dep: ReactiveNode
  sub: ReactiveNode
  prevSub: Link | undefined
  nextSub: Link | undefined
  prevDep: Link | undefined
  nextDep: Link | undefined
}

export interface Stack<T> {
  value: T
  prev: Stack<T> | undefined
}

export interface EffectNode extends ReactiveNode {
  fn: EffectCallback
  destroy: MaybeDestroy
}

export interface ComputedNode<T = any> extends ReadableNode {
  value: T | undefined
  compute: Compute<T>
}

export interface SignalNode<T = any> extends WritableNode {
  value: T
  pendingValue: T
}

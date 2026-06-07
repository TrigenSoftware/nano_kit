import type { ValueOrAccessor } from 'kida'
import type {
  Primitive,
  AnyFn
} from './common.js'

export type LazyChild<T extends () => Child = () => Child> = T & {
  /** Mark fn as lazy child. */
  c: true
}

export type Child = ChildNode | DocumentFragment | LazyChild<() => Child> | ValueOrAccessor<Primitive>

export type Children = Child[]

export type ChildrenWithSlots<S extends AnySlot, C extends unknown[] = Children> = C extends (infer D)[]
  ? (D | S)[]
  : never

export interface Slot<
  C,
  F extends (...args: any[]) => Slot<C, F>
> {
  f: F
  c: C
}

export interface SlotDef<C> {
  // oxlint-disable-next-line typescript/prefer-function-type
  (slotContent: C): Slot<C, this>
}

export type AnySlot = Slot<any, AnyFn>

export type AnySlotDef = SlotDef<any>

export type MapSlotDefsToContents<D extends unknown[]> = D extends [infer F, ...infer R]
  ? [
    F extends SlotDef<infer C>
      ? C | undefined
      : never,
    ...MapSlotDefsToContents<R>
  ]
  : []

export type MapSlotDefsToSlot<D extends AnySlotDef[]> = ReturnType<D[number]>

export type Renderer<
  T extends Child,
  C extends unknown[] = Children
> = (children: C | undefined) => T

export type RendererWithSlots<
  T extends Child,
  D extends AnySlotDef[]
> = (...children: [...MapSlotDefsToContents<D>, Children | undefined]) => T

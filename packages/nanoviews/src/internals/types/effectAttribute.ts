import type { UnknownAttributes } from './attributes.js'

declare module 'nanoviews' {
  // The value an attribute takes may be about the element it sits on, so the
  // map is asked with the target and answers for it. An attribute that does
  // not care simply never mentions it
  interface EffectAttributeValues<Target extends Element> {
  }

  interface EffectAttributeTargets {
  }
}

export type GetEffectAttributeValue<
  T extends string,
  Target extends Element
> = T extends keyof import('nanoviews').EffectAttributeValues<Target>
  ? import('nanoviews').EffectAttributeValues<Target>[T]
  : never

export type PickEffectAttributesByTarget<Target extends Element> = {
  [K in keyof import('nanoviews').EffectAttributeTargets]?: Target extends import('nanoviews').EffectAttributeTargets[K]
    ? GetEffectAttributeValue<K, Target>
    : never
}

export type EffectAttributeId = string

export type EffectAttributeCallback<Target extends Element = Element, Value = unknown> = (
  target: Target,
  value: Value,
  attributes: Readonly<UnknownAttributes>
) => void

import type {
  EffectAttributeId,
  EffectAttributeCallback
} from '../types/index.js'

// The registry is born on the first effect attribute, so an app that creates
// none leaves nothing behind: with `createEffectAttribute` shaken out, the
// binding is a `let` nothing ever assigns, and the lookup below it folds away
// oxlint-disable-next-line import/no-mutable-exports
export let effectAttributes: Map<EffectAttributeId, EffectAttributeCallback> | undefined

/**
 * Create effect attribute
 * @param id - Effect attribute id
 * @param callback - Effect attribute handler
 * @returns Effect attribute id
 */
/* @__NO_SIDE_EFFECTS__ */
export function createEffectAttribute<
  ID extends string,
  TargetElement extends Element,
  Value
>(id: ID, callback: EffectAttributeCallback<TargetElement, Value>) {
  (effectAttributes ??= new Map()).set(id, callback as EffectAttributeCallback)

  return id
}

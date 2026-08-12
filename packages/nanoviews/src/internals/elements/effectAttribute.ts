import type {
  EffectAttributeId,
  EffectAttributeCallback
} from '../types/index.js'

export const effectAttributes = new Map<EffectAttributeId, EffectAttributeCallback>()

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
  effectAttributes.set(id, callback as EffectAttributeCallback)

  return id
}

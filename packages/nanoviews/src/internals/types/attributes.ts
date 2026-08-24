import type { Signalish } from 'kida'
import type { Primitive } from './common.js'
import type {
  ElementName,
  IntrinsicElementsAttributes,
  PickElementType
} from './dom/elements.js'
import type { PickEffectAttributesByTarget } from './effectAttribute.js'

export type PrimitiveAttributeValue = Signalish<Primitive>

export type Attributes<Tag extends ElementName> =
  & PickEffectAttributesByTarget<PickElementType<Tag>>
  & IntrinsicElementsAttributes[Tag]

export type UnknownAttributes = Record<string, unknown>

export interface ValueEntry {
  /**
   * What the entry is called in its parent: a property key, an index, the preview of a `Map` key.
   */
  readonly name: string
  /**
   * The live value, or `Getter` for an accessor property.
   */
  readonly value: unknown
}

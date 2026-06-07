export function defineProtoProp(name: string, value?: unknown) {
  // @ts-expect-error Define property on prototype
  Element.prototype[name] = value
}

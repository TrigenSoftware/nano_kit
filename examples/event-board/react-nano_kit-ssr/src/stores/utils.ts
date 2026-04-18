export { slugify } from '#src/services/events'

export function optimisticId() {
  return `optimistic-${crypto.randomUUID()}`
}

export function datetimeLocalValue(value: number) {
  return new Date(value).toISOString().slice(0, 16)
}

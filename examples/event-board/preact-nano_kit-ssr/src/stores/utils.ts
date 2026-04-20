export function datetimeLocalValue(value: number) {
  return new Date(value).toISOString().slice(0, 16)
}
